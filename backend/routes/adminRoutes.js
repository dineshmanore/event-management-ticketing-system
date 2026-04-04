const router = require('express').Router()
const c      = require('../controllers/adminController')
const auth   = require('../middleware/authMiddleware')

// Actors (no auth — needed before login in some flows, but safe read-only)
router.get('/actors', c.getActors)
router.post('/actors', auth, c.addActor)
router.put('/actors/:id', auth, c.updateActor)
router.delete('/actors/:id', auth, c.deleteActor)

// Stats
router.get('/stats', auth, c.getStats)

// Movies — BUG FIX: POST /movies was missing entirely.
// saveMovie() in admin.js POSTed here but got 404 every time.
router.post('/movies',       auth, c.addMovie)
router.put('/movies/:id',    auth, c.updateMovie)
router.delete('/movies/:id', auth, c.deleteMovie)

// Events
router.get('/events', auth, (req, res) => {
  const Event = require('../models/Event.mongo')
  const { addLegacyId } = require('../utils/id')
  Event.find({})
    .sort({ date: 1 })
    .lean()
    .then((docs) => {
      const mapped = (docs || []).map((d) => {
        const out = addLegacyId(d);
        out.price_from = d.priceFrom ?? 0;
        out.price_to = d.priceTo ?? 0;
        out.age_limit = d.ageLimit ?? 'All Ages';
        return out;
      });
      res.json(mapped);
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
})
router.post('/events',       auth, c.addEvent)
router.put('/events/:id',    auth, c.updateEvent)
router.delete('/events/:id', auth, c.deleteEvent)

// Bookings
router.get('/bookings',         auth, c.getAllBookings)
router.delete('/bookings/:id',  auth, c.deleteBooking)

// Users
router.get('/users',            auth, c.getAllUsers)
router.delete('/users/:id',     auth, c.deleteUser)

module.exports = router