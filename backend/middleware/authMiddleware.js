const jwt = require('jsonwebtoken')
const User = require('../models/User.mongo')

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader)
    return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]

  if (!token)
    return res.status(401).json({ message: 'Token missing' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'showtime_secret')
    // Backward-compat: older tokens may contain MySQL numeric user id.
    // Map it to MongoDB user _id so Mongo queries don't CastError.
    const idStr = String(decoded.id || '')
    if (/^[0-9]+$/.test(idStr)) {
      const u = await User.findOne({ mysqlId: Number(idStr) }).select('_id role').lean()
      if (!u) return res.status(401).json({ message: 'Invalid or expired token' })
      decoded.id = String(u._id)
      if (!decoded.role) decoded.role = u.role
    }

    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
