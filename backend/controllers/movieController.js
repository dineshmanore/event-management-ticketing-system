const Movie = require('../models/Movie.mongo')
const Event = require('../models/Event.mongo')
const Actor = require('../models/Actor.mongo')
const { buildIdQuery, addLegacyId, isNumericId } = require('../utils/id')

exports.getMovies = (req, res) => {
  const { genre, language, category, limit } = req.query;
  const filter = {};

  if (genre && genre !== 'all') {
    filter.genre = new RegExp(genre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (language) {
    filter.language = new RegExp(language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (category) {
    filter.category = category;
  }

  let query = Movie.find(filter).sort({ createdAt: -1 });
  if (limit) query = query.limit(parseInt(limit));

  query
    .lean()
    .then((docs) =>
      res.json(
        docs.map((d) => {
          const out = addLegacyId(d);
          out.trailer_url = d.trailerUrl || '';
          return out;
        })
      )
    )
    .catch(() => res.status(500).json({ message: 'Database error' }))
}

exports.searchMovies = async (req, res) => {
  const { q, category } = req.query;
  if (!q) return res.json([]);

  const query = String(q).trim();
  const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  try {
    let results = [];
    
    // Context-aware search logic
    if (['events', 'sports', 'plays', 'activities'].includes(category)) {
      const filter = { title: rx };
      
      if (category === 'sports') {
        filter.category = { $in: ['cricket', 'football', 'kabaddi', 'sport', 'adventure'] };
      } else if (category === 'plays') {
        filter.category = 'play';
      } else if (category === 'activities') {
        filter.category = 'adventure';
      } else if (category === 'events') {
        // "Events" typically excludes sports, plays, etc.
        filter.category = { $nin: ['play', 'cricket', 'football', 'kabaddi', 'sport', 'adventure'] };
      }

      const docs = await Event.find(filter).limit(10).lean();
      results = docs.map(d => ({ ...addLegacyId(d), is_event: true }));
    } else {
      // Default: Search Movies or Streams
      const filter = { $or: [{ title: rx }, { genre: rx }] };
      
      if (category === 'stream') {
        filter.category = 'stream';
      } else {
        // Only search movies, exclude streams if category is specifically "index" or "movies"
        filter.category = { $ne: 'stream' };
      }

      const docs = await Movie.find(filter).limit(10).lean();
      results = docs.map(d => ({ ...addLegacyId(d), is_event: false }));
    }

    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getMovieById = (req, res) => {
  const { id } = req.params;
  const idQuery = buildIdQuery(id);
  if (!idQuery) return res.status(400).json({ message: 'Movie not found' });

  Movie.findOne(idQuery)
    .lean()
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Movie not found' });

      const cast =
        Array.isArray(doc.cast) && doc.cast.length
          ? doc.cast.map((c) => ({ name: c.actorName || '', image: c.actorImage || '', role: c.role || 'Unknown' }))
          : [];

      const out = { ...addLegacyId(doc), cast };
      out.trailer_url = doc.trailerUrl || '';
      return res.json(out);
    })
    .catch(() => res.status(500).json({ message: 'Database error' }));
};

exports.addMovie = (req, res) => {
  const { title, genre, language, rating, votes, poster, banner, description, category } = req.body

  if (!title) return res.status(400).json({ message: 'Title is required' })

  Movie.create({
    title,
    genre,
    language,
    rating: Number(rating || 0),
    votes: Number(votes || 0),
    poster,
    banner,
    description,
    category
  })
    .then((doc) => res.json({ message: 'Movie added successfully', id: doc.mysqlId ?? String(doc._id) }))
    .catch(() => res.status(500).json({ message: 'Database error' }))
}
