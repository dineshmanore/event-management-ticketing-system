const Movie = require('../models/Movie.mongo')
const Actor = require('../models/Actor.mongo')
const { buildIdQuery, addLegacyId, isNumericId } = require('../utils/id')

exports.getMovies = (req, res) => {
  Movie.find({})
    .sort({ createdAt: -1 })
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

exports.searchMovies = (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const query = String(q).trim();
  const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  Movie.find({
    $or: [{ title: rx }, { genre: rx }, { language: rx }]
  })
    .limit(10)
    .lean()
    .then((docs) => res.json(docs.map(addLegacyId)))
    .catch(() => res.status(500).json({ message: 'Database error' }));
}

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
