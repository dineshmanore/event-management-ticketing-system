const Booking = require('../models/Booking.mongo')
const Movie = require('../models/Movie.mongo')
const Event = require('../models/Event.mongo')
const User = require('../models/User.mongo')
const { buildIdQuery, addLegacyId } = require('../utils/id')
const { sendBookingConfirmation } = require('../utils/mailer')

// ── GET BOOKED SEATS FOR A MOVIE ─────────────────────────────────────────
// Called by seats.js: GET /api/bookings/seats/:movieId?date=YYYY-MM-DD
// No auth required — anyone needs to see which seats are taken
exports.getBookedSeats = (req, res) => {
  const { movieId } = req.params;
  const { date } = req.query;
  const movieQuery = buildIdQuery(movieId);
  if (!movieQuery) return res.json([]);

  Movie.findOne(movieQuery)
    .then((movie) => {
      if (!movie) return res.json([]);
      const filter = { movie: movie._id };
      if (date) filter.showDate = date;
      return Booking.find(filter).select('seats').lean();
    })
    .then((rows) => {
      if (!rows) return;
      const booked = [];
      rows.forEach((row) => {
        if (row.seats) {
          row.seats.split(',').forEach((s) => {
            const t = String(s).trim();
            if (t) booked.push(t);
          });
        }
      });
      res.json(booked);
    })
    .catch(() => res.status(500).json([]));
}

// ── BOOK SEATS ────────────────────────────────────────────────────────────
// Called by seats.js: POST /api/bookings
// Requires auth token → user_id comes from req.user.id (set by middleware)
exports.bookSeats = (req, res) => {
  const user_id = req.user.id                 // from JWT middleware — mongo _id
  const { movieId, seats, totalPrice, date } = req.body

  if (!movieId || !seats || seats.length === 0) {
    return res.status(400).json({ message: 'Movie ID and seats are required' })
  }

  const seatString = Array.isArray(seats) ? seats.join(',') : seats
  const showDate = date || new Date().toISOString().split('T')[0];
  const requested = Array.isArray(seats) ? seats : String(seats).split(',');
  const isEventBooking = requested.some((s) => String(s).toLowerCase().includes('general'));

  const idQuery = buildIdQuery(String(movieId));
  const itemPromise = isEventBooking ? Event.findOne(idQuery) : Movie.findOne(idQuery);

  itemPromise
    .then((item) => {
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const filter = isEventBooking ? { event: item._id } : { movie: item._id };
      filter.showDate = showDate;

      return Booking.find(filter).select('seats').lean().then((rows) => ({ item, rows }));
    })
    .then((payload) => {
      if (!payload) return;
      const { item, rows } = payload;
      const alreadyBooked = [];
      (rows || []).forEach((r) => {
        if (r.seats) r.seats.split(',').forEach((s) => alreadyBooked.push(String(s).trim()));
      });

      const conflict = requested.some((s) => alreadyBooked.includes(String(s).trim()));
      if (conflict) {
        return res.status(409).json({ message: 'One or more seats are already booked. Please reselect.' });
      }

      return Booking.create({
        user: user_id,
        movie: isEventBooking ? null : item._id,
        event: isEventBooking ? item._id : null,
        seats: seatString,
        totalPrice: Number(totalPrice || 0),
        showDate,
        bookingTimeLegacy: new Date()
      }).then(async (b) => {
        // Send Confirmation Email
        try {
          const user = await User.findById(user_id).select('name email').lean();
          if (user && user.email) {
            await sendBookingConfirmation(user.email, user.name, {
              id: b.mysqlId ?? String(b._id),
              title: item.title,
              date: showDate,
              seats: seatString,
              price: totalPrice
            });
          }
        } catch (mailErr) {
          console.error('Failed to send booking confirmation email:', mailErr);
        }
        
        res.json({ success: true, bookingId: b.mysqlId ?? String(b._id) });
      });
    })
    .catch((e) => res.status(500).json({ message: 'Booking failed', error: e.message }));
}

// ── GET USER'S OWN BOOKINGS ───────────────────────────────────────────────
// Called by dashboard.html: GET /api/bookings/my-bookings
// Requires auth token
exports.getUserBookings = (req, res) => {
  const user_id = req.user.id;

  Booking.find({ user: user_id })
    .sort({ createdAt: -1 })
    .populate('movie')
    .populate('event')
    .lean()
    .then((rows) => {
      const out = (rows || []).map((b) => {
        const isEvent = !!b.event;
        const item = isEvent ? b.event : b.movie;
        const mapped = {
          ...addLegacyId(b),
          user_id: b.user,
          movie_id: isEvent ? (item?.mysqlId ?? item?._id) : (item?.mysqlId ?? item?._id),
          is_event: isEvent ? 1 : 0,
          title: item?.title || (isEvent ? 'Event' : 'Movie'),
          poster: isEvent ? (item?.image || item?.banner || '') : (item?.poster || ''),
          total_price: b.totalPrice ?? 0,
          show_date: b.showDate || null,
          seats: b.seats || '',
          event_venue: isEvent ? (item?.venue || '') : null,
          event_city: isEvent ? (item?.city || '') : null,
          event_time: isEvent ? (item?.time || '') : null
        };
        return mapped;
      });
      res.json(out);
    })
    .catch(() => res.status(500).json({ message: 'Database error' }));
}

// ── CANCEL OWN BOOKING ──────────────────────────────────────────────────
// Called by dashboard.html: DELETE /api/bookings/:id
// Requires auth token
exports.cancelBooking = (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Booking not found or not authorized' });

  Booking.findOneAndDelete({ ...q, user: user_id })
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Booking not found or not authorized' });
      res.json({ message: 'Booking successfully canceled.' });
    })
    .catch(() => res.status(500).json({ message: 'Database error' }));
}
