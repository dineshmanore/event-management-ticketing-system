const router = require('express').Router()
const c      = require('../controllers/bookingController')
const auth   = require('../middleware/authMiddleware')

// Public — anyone can see which seats are booked
router.get('/seats/:movieId', c.getBookedSeats)

// Protected — must be logged in
router.get('/my-bookings', auth, c.getUserBookings)
router.post('/',           auth, c.bookSeats)
router.delete('/:id',      auth, c.cancelBooking)

module.exports = router
