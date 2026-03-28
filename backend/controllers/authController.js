const db = require('../models/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })

  const hash = bcrypt.hashSync(password, 8)

  db.query(
    'INSERT INTO users(name, email, password) VALUES(?, ?, ?)',
    [name, email, hash],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ message: 'Email already registered' })
        return res.status(500).json({ message: 'Database error' })
      }
      res.json({ message: 'User created' })
    }
  )
}

exports.login = (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    if (result.length === 0) return res.status(404).json({ message: 'User not found' })

    const user = result[0]
    const valid = bcrypt.compareSync(password, user.password)

    if (!valid) return res.status(401).json({ message: 'Incorrect password' })

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'showtime_secret',
      { expiresIn: '7d' }
    )

    res.json({ token, name: user.name })
  })
}
