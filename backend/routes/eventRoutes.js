const router = require('express').Router()
const c = require('../controllers/eventController')

router.get('/',     c.getEvents)
router.get('/:id',  c.getEventById)
router.post('/',    c.addEvent)
router.put('/:id',  c.updateEvent)
router.delete('/:id', c.deleteEvent)

module.exports = router
