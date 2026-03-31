const db = require('../models/db')

// ── GET BOOKED SEATS FOR A MOVIE ─────────────────────────────────────────
// Called by seats.js: GET /api/bookings/seats/:movieId?date=YYYY-MM-DD
// No auth required — anyone needs to see which seats are taken
exports.getBookedSeats = (req, res) => {
  const { movieId } = req.params;
  const { date } = req.query;

  let query = 'SELECT seats FROM bookings WHERE movie_id = ?';
  let params = [movieId];
  if (date) {
    query += ' AND show_date = ?';
    params.push(date);
  }

  db.query(query, params, (err, results) => {
      if (err) return res.status(500).json([])

      // Flatten all seat strings into one array of seat IDs
      const booked = []
      results.forEach(row => {
        if (row.seats) {
          row.seats.split(',').forEach(s => {
            const trimmed = s.trim()
            if (trimmed) booked.push(trimmed)
          })
        }
      })

      res.json(booked)   // e.g. ['A1','C3','F5']
    }
  )
}

// ── BOOK SEATS ────────────────────────────────────────────────────────────
// Called by seats.js: POST /api/bookings
// Requires auth token → user_id comes from req.user.id (set by middleware)
exports.bookSeats = (req, res) => {
  const user_id = req.user.id                 // from JWT middleware — real user
  const { movieId, seats, totalPrice, date } = req.body

  if (!movieId || !seats || seats.length === 0) {
    return res.status(400).json({ message: 'Movie ID and seats are required' })
  }

  const seatString = Array.isArray(seats) ? seats.join(',') : seats

  // Check for seat conflicts (race condition guard)
  let query = 'SELECT seats FROM bookings WHERE movie_id = ?';
  let params = [movieId];
  if (date) {
    query += ' AND show_date = ?';
    params.push(date);
  }

  db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })

      const alreadyBooked = []
      results.forEach(row => {
        if (row.seats) row.seats.split(',').forEach(s => alreadyBooked.push(s.trim()))
      })

      const requested = Array.isArray(seats) ? seats : seats.split(',')
      const conflict  = requested.some(s => alreadyBooked.includes(s.trim()))

      if (conflict) {
        return res.status(409).json({ message: 'One or more seats are already booked. Please reselect.' })
      }

      const showDate = date || new Date().toISOString().split('T')[0];

      // All clear — insert booking
      db.query(
        'INSERT INTO bookings (user_id, movie_id, seats, total_price, show_date) VALUES (?, ?, ?, ?, ?)',
        [user_id, movieId, seatString, totalPrice || 0, showDate],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: 'Booking failed', error: err2.message })
          res.json({ success: true, bookingId: result.insertId })
        }
      )
    }
  )
}

// ── GET USER'S OWN BOOKINGS ───────────────────────────────────────────────
// Called by dashboard.html: GET /api/bookings/my-bookings
// Requires auth token
exports.getUserBookings = (req, res) => {
  const user_id = req.user.id   // real user from JWT

  db.query(
    `SELECT b.*, m.title, m.poster, m.genre, m.language
     FROM bookings b
     JOIN movies m ON b.movie_id = m.id
     WHERE b.user_id = ?
     ORDER BY b.booking_time DESC`,
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(result)
    }
  )
}

// ── CANCEL OWN BOOKING ──────────────────────────────────────────────────
// Called by dashboard.html: DELETE /api/bookings/:id
// Requires auth token
exports.cancelBooking = (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  db.query(
    'DELETE FROM bookings WHERE id = ? AND user_id = ?',
    [id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Booking not found or not authorized' });
      }
      res.json({ message: 'Booking successfully canceled.' });
    }
  );
}
