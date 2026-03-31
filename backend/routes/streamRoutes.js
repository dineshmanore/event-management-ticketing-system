const router = require('express').Router();
const c = require('../controllers/streamController');

router.get('/', c.getStreams);
router.get('/:id', c.getStreamById);
router.post('/add', c.addStream);
router.put('/:id', c.updateStream);
router.delete('/:id', c.deleteStream);

module.exports = router;
