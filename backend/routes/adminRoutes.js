const router = require('express').Router()
const auth = require('../middleware/authMiddleware')

router.get('/admin', auth, (req, res) => {
  res.json({ message: 'Admin Dashboard', userId: req.user.id })
})

module.exports = router
