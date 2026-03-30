console.log("🚀 THIS IS BACKEND SERVER");

require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes    = require('./routes/authRoutes')
const movieRoutes   = require('./routes/movieRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const eventRoutes   = require('./routes/eventRoutes')
const adminRoutes   = require('./routes/adminRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',     authRoutes)
app.use('/api/movies',   movieRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/events',   eventRoutes)
app.use('/api',          paymentRoutes)

app.use('/api/admin', (req, res, next) => {
  console.log("🔥 ADMIN HIT");
  next();
}, adminRoutes);

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

app.get('/test', (req, res) => {
  res.send("TEST WORKING");
});