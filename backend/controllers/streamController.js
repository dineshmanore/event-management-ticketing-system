const Stream = require('../models/Stream.mongo');
const { buildIdQuery, addLegacyId } = require('../utils/id')

exports.getStreams = (req, res) => {
  Stream.find({ status: 'active' })
    .sort({ releaseDate: -1 })
    .lean()
    .then((rows) => {
      const mapped = (rows || []).map((s) => {
        const out = addLegacyId(s);
        out.banner_image = s.bannerImage || '';
        out.poster_image = s.posterImage || '';
        out.release_date = s.releaseDate || null;
        out.price_rent = s.priceRent || 0;
        out.price_buy = s.priceBuy || 0;
        out.trailer_url = s.trailerUrl || '';
        out.category = s.category || 'Stream';
        return out;
      });
      res.json(mapped);
    })
    .catch((err) => res.status(500).json({ message: 'Database error', error: err.message }));
};

exports.getStreamById = (req, res) => {
  const { id } = req.params;
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Stream not found' });

  Stream.findOne(q)
    .lean()
    .then((s) => {
      if (!s) return res.status(404).json({ message: 'Stream not found' });
      const out = addLegacyId(s);
      out.banner_image = s.bannerImage || '';
      out.poster_image = s.posterImage || '';
      out.release_date = s.releaseDate || null;
      out.price_rent = s.priceRent || 0;
      out.price_buy = s.priceBuy || 0;
      out.trailer_url = s.trailerUrl || '';
      out.category = s.category || 'Stream';
      res.json(out);
    })
    .catch((err) => res.status(500).json({ message: 'Database error', error: err.message }));
};

exports.addStream = (req, res) => {
  const { title, description, banner_image, poster_image, release_date, duration, genres, language, rating, price_rent, price_buy, trailer_url, category } = req.body;
  
  if (!title) return res.status(400).json({ message: 'Title is required' });
  Stream.create({
    title,
    description,
    bannerImage: banner_image,
    posterImage: poster_image,
    releaseDate: release_date,
    duration: duration ? Number(duration) : null,
    genres,
    language,
    rating: Number(rating || 0),
    priceRent: Number(price_rent || 0),
    priceBuy: Number(price_buy || 0),
    trailerUrl: trailer_url,
    status: 'active',
    category: category || 'Stream'
  })
    .then((doc) => res.json({ message: 'Stream added successfully', id: doc.mysqlId ?? String(doc._id) }))
    .catch((err) => res.status(500).json({ message: 'Database error', error: err.message }));
};

exports.updateStream = (req, res) => {
  const { id } = req.params;
  const { title, description, banner_image, poster_image, release_date, duration, genres, language, rating, price_rent, price_buy, trailer_url, category } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const q = buildIdQuery(id);
  if (!q) return res.status(404).json({ message: 'Stream not found' });

  Stream.findOneAndUpdate(
    q,
    {
      $set: {
        title,
        description,
        bannerImage: banner_image,
        posterImage: poster_image,
        releaseDate: release_date,
        duration: duration ? Number(duration) : null,
        genres,
        language,
        rating: Number(rating || 0),
        priceRent: Number(price_rent || 0),
        priceBuy: Number(price_buy || 0),
        trailerUrl: trailer_url,
        category: category || 'Stream'
      }
    },
    { new: true }
  )
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Stream not found' });
      res.json({ message: 'Stream updated successfully' });
    })
    .catch((err) => res.status(500).json({ message: 'Database error', error: err.message }));
};

exports.deleteStream = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Stream not found' });

  Stream.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Stream not found' });
      res.json({ message: 'Stream deleted' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }));
};
