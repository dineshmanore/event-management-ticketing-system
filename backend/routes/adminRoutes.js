const router = require('express').Router()
const c      = require('../controllers/adminController')
const auth   = require('../middleware/authMiddleware')

// All admin routes require a valid JWT token
// In production you'd add a separate admin-role check middleware

router.get('/stats',            auth, c.getStats)

// Movies
router.put('/movies/:id',       auth, c.updateMovie)
router.delete('/movies/:id',    auth, c.deleteMovie)

// Events
router.get('/events',           auth, (req, res) => {
  const db = require('../models/db')
  db.query('SELECT * FROM events ORDER BY date ASC', (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(result)
  })
})
router.post('/events',          auth, c.addEvent)
router.put('/events/:id',       auth, c.updateEvent)
router.delete('/events/:id',    auth, c.deleteEvent)

// Bookings
router.get('/bookings',         auth, c.getAllBookings)
router.delete('/bookings/:id',  auth, c.deleteBooking)

// Users
router.get('/users',            auth, c.getAllUsers)
router.delete('/users/:id',     auth, c.deleteUser)

module.exports = router
