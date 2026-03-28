const router = require('express').Router()
const c = require('../controllers/paymentController')

router.post('/create-order', c.createOrder)
router.post('/verify-payment', c.verifyPayment)

module.exports = router
