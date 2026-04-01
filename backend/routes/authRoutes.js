const router = require('express').Router()
const c = require('../controllers/authController')
const auth = require('../middleware/authMiddleware')

router.post('/signup', c.signup)
router.get('/verify-email/:token', c.verifyEmail)
router.post('/login', c.login)
router.post('/google', c.googleLogin)

// Profile (protected)
router.get('/me', auth, c.getMe)
router.put('/me', auth, c.updateMe)

module.exports = router
