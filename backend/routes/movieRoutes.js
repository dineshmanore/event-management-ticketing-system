const router = require('express').Router()
const c = require('../controllers/movieController')

router.get('/', c.getMovies)
router.get('/:id', c.getMovieById)
router.post('/add', c.addMovie)

module.exports = router
