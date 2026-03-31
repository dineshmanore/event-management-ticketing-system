const router = require('express').Router()
const c = require('../controllers/authController')

router.post('/signup', c.signup)
router.post('/login', c.login)
router.post('/google', c.googleLogin)

module.exports = router
