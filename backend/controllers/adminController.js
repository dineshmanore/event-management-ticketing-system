const db = require('../models/db')

// ── MOVIES ─────────────────────────────────────────────────────────────────
// BUG FIX: addMovie was missing entirely. saveMovie() in admin.js POST'd to
// /api/admin/movies but no route/handler existed for it.
exports.addMovie = (req, res) => {
  const { title, genre, language, rating, votes, poster, banner, description, category, cast } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  db.query(
    'INSERT INTO movies (title,genre,language,rating,votes,poster,banner,description,category) VALUES (?,?,?,?,?,?,?,?,?)',
    [title, genre, language, rating || 0, votes || 0, poster, banner, description, category || 'Movies'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })
      const movieId = result.insertId

      // Save cast if provided
      if (!cast || !Array.isArray(cast) || cast.length === 0) {
        return res.json({ message: 'Movie added', id: movieId })
      }

      const castValues = cast.map(c => [movieId, c.actor_id, c.role || 'Unknown'])
      db.query(
        'INSERT INTO movie_cast (movie_id, actor_id, role) VALUES ?',
        [castValues],
        (castErr) => {
          if (castErr) console.error('Cast insert error:', castErr.message)
          res.json({ message: 'Movie added', id: movieId })
        }
      )
    }
  )
}

exports.updateMovie = (req, res) => {
  const { id } = req.params
  const { title, genre, language, rating, votes, poster, banner, description, category, cast } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  db.query(
    'UPDATE movies SET title=?,genre=?,language=?,rating=?,votes=?,poster=?,banner=?,description=?,category=? WHERE id=?',
    [title, genre, language, rating || 0, votes || 0, poster, banner, description, category || 'Movies', id],
    (err) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })

      // Update cast: always delete old cast first
      db.query('DELETE FROM movie_cast WHERE movie_id = ?', [id], (delErr) => {
        if (delErr) return res.status(500).json({ message: 'DB error', error: delErr.message });

        if (!cast || !Array.isArray(cast) || cast.length === 0) {
          return res.json({ message: 'Movie updated (no cast)' });
        }

        const castValues = cast.map(c => [id, c.actor_id, c.role || 'Unknown']);
        db.query(
          'INSERT INTO movie_cast (movie_id, actor_id, role) VALUES ?',
          [castValues],
          (castErr) => {
            if (castErr) console.error('Cast update error:', castErr.message);
            res.json({ message: 'Movie updated' });
          }
        );
      });
    }
  )
}

exports.deleteMovie = (req, res) => {
  const { id } = req.params
  db.query('SELECT COUNT(*) AS cnt FROM bookings WHERE movie_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    if (result[0].cnt > 0) {
      return res.status(400).json({ message: `Cannot delete: ${result[0].cnt} booking(s) exist for this movie.` })
    }
    db.query('DELETE FROM movie_cast WHERE movie_id = ?', [id], () => {
      db.query('DELETE FROM movies WHERE id = ?', [id], (err2) => {
        if (err2) return res.status(500).json({ message: 'DB error' })
        res.json({ message: 'Movie deleted' })
      })
    })
  })
}

// ── EVENTS ────────────────────────────────────────────────────────────────
exports.updateEvent = (req, res) => {
  const { id } = req.params
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit, status } = req.body
  db.query(
    'UPDATE events SET title=?,category=?,venue=?,city=?,date=?,time=?,price_from=?,price_to=?,image=?,banner=?,description=?,language=?,age_limit=?,status=? WHERE id=?',
    [title, category, venue, city, date, time, price_from || 0, price_to || 0, image, banner, description, language, age_limit || 'All Ages', status || 'active', id],
    (err) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })
      res.json({ message: 'Event updated' })
    }
  )
}

exports.addEvent = (req, res) => {
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })
  db.query(
    'INSERT INTO events (title,category,venue,city,date,time,price_from,price_to,image,banner,description,language,age_limit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [title, category || 'concert', venue, city || 'Mumbai', date, time, price_from || 0, price_to || 0, image, banner, description, language, age_limit || 'All Ages'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })
      res.json({ message: 'Event added', id: result.insertId })
    }
  )
}

exports.deleteEvent = (req, res) => {
  db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json({ message: 'Event deleted' })
  })
}

// ── BOOKINGS ───────────────────────────────────────────────────────────────
exports.getAllBookings = (req, res) => {
  db.query(
    `SELECT b.*, u.name, u.email, m.title, m.poster, m.genre
     FROM bookings b
     JOIN users u  ON b.user_id  = u.id
     JOIN movies m ON b.movie_id = m.id
     ORDER BY b.booking_time DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' })
      res.json(result)
    }
  )
}

exports.deleteBooking = (req, res) => {
  db.query('DELETE FROM bookings WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json({ message: 'Booking deleted' })
  })
}

// ── USERS ──────────────────────────────────────────────────────────────────
exports.getAllUsers = (req, res) => {
  db.query(
    'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC',
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' })
      res.json(result)
    }
  )
}

exports.deleteUser = (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json({ message: 'User deleted' })
  })
}

// ── ACTORS ─────────────────────────────────────────────────────────────────
exports.getActors = (req, res) => {
  db.query('SELECT * FROM actors ORDER BY name ASC', (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(result)
  })
}

// ── DASHBOARD STATS ────────────────────────────────────────────────────────
exports.getStats = (req, res) => {
  const queries = [
    'SELECT COUNT(*) AS movies   FROM movies',
    'SELECT COUNT(*) AS events   FROM events',
    'SELECT COUNT(*) AS bookings FROM bookings',
    'SELECT COUNT(*) AS users    FROM users',
    'SELECT COALESCE(SUM(total_price),0) AS revenue FROM bookings'
  ]
  Promise.all(queries.map(q => new Promise((resolve, reject) =>
    db.query(q, (err, r) => err ? reject(err) : resolve(r[0]))
  )))
  .then(([m, e, b, u, r]) => res.json({
    movies:   m.movies,
    events:   e.events,
    bookings: b.bookings,
    users:    u.users,
    revenue:  r.revenue
  }))
  .catch(err => res.status(500).json({ message: 'DB error', error: err.message }))
}