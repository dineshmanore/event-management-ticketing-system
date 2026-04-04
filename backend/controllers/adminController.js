const Movie = require('../models/Movie.mongo')
const Event = require('../models/Event.mongo')
const Booking = require('../models/Booking.mongo')
const User = require('../models/User.mongo')
const Actor = require('../models/Actor.mongo')
const { buildIdQuery, addLegacyId } = require('../utils/id')

// ── MOVIES ─────────────────────────────────────────────────────────────────
// BUG FIX: addMovie was missing entirely. saveMovie() in admin.js POST'd to
// /api/admin/movies but no route/handler existed for it.
exports.addMovie = (req, res) => {
  const { title, genre, language, rating, votes, poster, banner, trailer_url, description, category, cast } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  const castArr = Array.isArray(cast) ? cast : [];

  Promise.all(
    castArr.map(async (c) => {
      const actorDoc = c && c.actor_id ? await Actor.findOne(buildIdQuery(String(c.actor_id))).lean() : null;
      return {
        actor: actorDoc ? actorDoc._id : null,
        role: (c && c.role) || 'Unknown',
        actorName: actorDoc?.name || c?.name || null,
        actorImage: actorDoc?.image || c?.image || null,
        mysqlActorId: c && c.actor_id && /^[0-9]+$/.test(String(c.actor_id)) ? Number(c.actor_id) : undefined
      };
    })
  )
    .then((castDocs) =>
      Movie.create({
        title,
        genre,
        language,
        rating: Number(rating || 0),
        votes: Number(votes || 0),
        poster,
        banner,
        trailerUrl: trailer_url,
        description,
        category: category || 'Movies',
        cast: castDocs.filter(Boolean)
      })
    )
    .then((doc) => res.json({ message: 'Movie added', id: doc.mysqlId ?? String(doc._id) }))
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

exports.updateMovie = (req, res) => {
  const { id } = req.params
  const { title, genre, language, rating, votes, poster, banner, trailer_url, description, category, cast } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  const castArr = Array.isArray(cast) ? cast : [];
  Promise.all(
    castArr.map(async (c) => {
      const actorDoc = c && c.actor_id ? await Actor.findOne(buildIdQuery(String(c.actor_id))).lean() : null;
      return {
        actor: actorDoc ? actorDoc._id : null,
        role: (c && c.role) || 'Unknown',
        actorName: actorDoc?.name || c?.name || null,
        actorImage: actorDoc?.image || c?.image || null,
        mysqlActorId: c && c.actor_id && /^[0-9]+$/.test(String(c.actor_id)) ? Number(c.actor_id) : undefined
      };
    })
  )
    .then((castDocs) =>
      Movie.findOneAndUpdate(
        q,
        {
          $set: {
            title,
            genre,
            language,
            rating: Number(rating || 0),
            votes: Number(votes || 0),
            poster,
            banner,
            trailerUrl: trailer_url,
            description,
            category: category || 'Movies',
            cast: castDocs.filter(Boolean)
          }
        },
        { new: true }
      )
    )
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Movie updated' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

exports.deleteMovie = (req, res) => {
  const { id } = req.params
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Movie.findOne(q)
    .then((movie) => {
      if (!movie) return res.status(404).json({ message: 'Not found' });
      return Booking.countDocuments({ movie: movie._id }).then((cnt) => ({ movie, cnt }));
    })
    .then((payload) => {
      if (!payload) return;
      if (payload.cnt > 0) return res.status(400).json({ message: `Cannot delete: ${payload.cnt} booking(s) exist for this movie.` });
      return Movie.deleteOne({ _id: payload.movie._id }).then(() => res.json({ message: 'Movie deleted' }));
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

// ── EVENTS ────────────────────────────────────────────────────────────────
exports.updateEvent = (req, res) => {
  const { id } = req.params
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit, status } = req.body
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Event.findOneAndUpdate(
    q,
    {
      $set: {
        title,
        category,
        venue,
        city,
        date,
        time,
        priceFrom: Number(price_from || 0),
        priceTo: Number(price_to || 0),
        image,
        banner,
        description,
        language,
        ageLimit: age_limit || 'All Ages',
        status: status || 'active'
      }
    },
    { new: true }
  )
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Event updated' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

exports.addEvent = (req, res) => {
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })
  Event.create({
    title,
    category: category || 'concert',
    venue,
    city: city || 'Mumbai',
    date,
    time,
    priceFrom: Number(price_from || 0),
    priceTo: Number(price_to || 0),
    image,
    banner,
    description,
    language,
    ageLimit: age_limit || 'All Ages',
    status: 'active'
  })
    .then((doc) => res.json({ message: 'Event added', id: doc.mysqlId ?? String(doc._id) }))
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

exports.deleteEvent = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Event.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Event deleted' });
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

// ── BOOKINGS ───────────────────────────────────────────────────────────────
exports.getAllBookings = (req, res) => {
  Booking.find({})
    .sort({ createdAt: -1 })
    .populate('user')
    .populate('movie')
    .populate('event')
    .lean()
    .then((rows) => {
      const out = (rows || []).map((b) => {
        const isEvent = !!b.event;
        const item = isEvent ? b.event : b.movie;
        return {
          ...addLegacyId(b),
          user_id: b.user?._id || b.user,
          name: b.user?.name || '',
          email: b.user?.email || '',
          movie_id: isEvent ? (item?.mysqlId ?? item?._id) : (item?.mysqlId ?? item?._id),
          title: item?.title || '',
          poster: isEvent ? (item?.image || item?.banner || '') : (item?.poster || ''),
          genre: isEvent ? (item?.category || '') : (item?.genre || ''),
          total_price: b.totalPrice ?? 0,
          seats: b.seats || '',
          show_date: b.showDate || null
        };
      });
      res.json(out);
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

exports.deleteBooking = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Booking.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Booking deleted' });
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

// ── USERS ──────────────────────────────────────────────────────────────────
exports.getAllUsers = (req, res) => {
  User.find({})
    .sort({ createdAt: -1 })
    .lean()
    .then((rows) => {
      const out = (rows || []).map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        created_at: u.createdAt
      }));
      res.json(out);
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

exports.deleteUser = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  User.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'User deleted' });
    })
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

// ── ACTORS ─────────────────────────────────────────────────────────────────
exports.getActors = (req, res) => {
  Actor.find({})
    .sort({ name: 1 })
    .lean()
    .then((rows) => res.json((rows || []).map(addLegacyId)))
    .catch(() => res.status(500).json({ message: 'DB error' }))
}

exports.addActor = (req, res) => {
  const { name, image } = req.body
  if (!name) return res.status(400).json({ message: 'Actor name required' })

  Actor.create({ name, image })
    .then((doc) => res.json({ message: 'Actor added', id: String(doc._id) }))
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

exports.updateActor = (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;
  if (!name) return res.status(400).json({ message: 'Actor name required' });
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Actor.findOneAndUpdate(
    q,
    { $set: { name, image } },
    { new: true }
  )
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Actor updated' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }));
};

exports.deleteActor = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Actor.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Actor deleted' });
    })
    .catch(() => res.status(500).json({ message: 'DB error' }));
};

// ── DASHBOARD STATS ────────────────────────────────────────────────────────
exports.getStats = (req, res) => {
  Promise.all([
    Movie.countDocuments(),
    Event.countDocuments(),
    Booking.countDocuments(),
    User.countDocuments(),
    Booking.aggregate([{ $group: { _id: null, revenue: { $sum: '$totalPrice' } } }])
  ])
    .then(([movies, events, bookings, users, revenueAgg]) => {
      const revenue = revenueAgg && revenueAgg[0] ? revenueAgg[0].revenue : 0;
      res.json({ movies, events, bookings, users, revenue });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}