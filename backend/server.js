console.log("🚀 THIS IS BACKEND SERVER");

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const { connectMongo } = require('./models/mongo')

const authRoutes    = require('./routes/authRoutes')
const movieRoutes   = require('./routes/movieRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const eventRoutes   = require('./routes/eventRoutes')
const adminRoutes   = require('./routes/adminRoutes')
const streamRoutes  = require('./routes/streamRoutes')

const path = require('path')
const app = express()

app.use(cors())
app.use(express.json())

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/api/auth',     authRoutes)
app.use('/api/movies',   movieRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/events',   eventRoutes)
app.use('/api/stream',   streamRoutes)
app.use('/api',          paymentRoutes)

app.use('/api/admin', (req, res, next) => {
  console.log("🔥 ADMIN HIT");
  next();
}, adminRoutes);

app.get('/api/test-email-config', async (req, res) => {
  const { verifyConnection } = require('./utils/mailer');
  const result = await verifyConnection();
  res.json({
    message: result.success ? "SMTP Connection Successful" : "SMTP Connection Failed",
    ...result,
    env_present: {
      service: !!process.env.EMAIL_SERVICE,
      host: !!process.env.EMAIL_HOST,
      user: !!process.env.EMAIL_USER,
      pass: !!process.env.EMAIL_PASS
    }
  });
});

const PORT = process.env.PORT || 5000
connectMongo()
  .then(() => {
    console.log('MongoDB connected successfully')
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })

app.get('/test', (req, res) => {
  res.send("TEST WORKING");
});