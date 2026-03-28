const db = require('../models/db')

exports.getMovies = (req, res) => {
  db.query('SELECT * FROM movies', (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(result)
  })
}

exports.getMovieById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM movies WHERE id=?", [id], (err, movieResult) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (movieResult.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    db.query(`
      SELECT a.name, a.image, mc.role
      FROM movie_cast mc
      JOIN actors a ON mc.actor_id = a.id
      WHERE mc.movie_id=?
    `, [id], (err, castResult) => {

      if (err) return res.status(500).json({ message: "Database error" });

      res.json({
        ...movieResult[0],
        cast: castResult || []
      });

    });
  });
};

exports.addMovie = (req, res) => {
  const { title, genre, language, rating, votes, poster, banner, description, category } = req.body

  if (!title) return res.status(400).json({ message: 'Title is required' })

  db.query(
    'INSERT INTO movies(title, genre, language, rating, votes, poster, banner, description, category) VALUES(?,?,?,?,?,?,?,?,?)',
    [title, genre, language, rating, votes, poster, banner, description, category],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Movie added successfully', id: result.insertId })
    }
  )
}
