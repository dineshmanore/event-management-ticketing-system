const Razorpay = require('razorpay')
const crypto = require('crypto')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
})

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount) return res.status(400).json({ message: 'Amount is required' })

    const options = {
      amount: Math.round(amount) * 100,   // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    }

    const order = await razorpay.orders.create(options)
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.message })
  }
}

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ success: false, message: 'Missing payment details' })

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true })
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' })
  }
}
