const db = require('../models/db');

exports.getStreams = (req, res) => {
  db.query('SELECT * FROM streams WHERE status = "active" ORDER BY release_date DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(result);
  });
};

exports.getStreamById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM streams WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Stream not found' });
    res.json(result[0]);
  });
};

exports.addStream = (req, res) => {
  const { title, description, banner_image, poster_image, release_date, duration, genres, language, rating, price_rent, price_buy, trailer_url } = req.body;
  
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const query = `
    INSERT INTO streams (title, description, banner_image, poster_image, release_date, duration, genres, language, rating, price_rent, price_buy, trailer_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [title, description, banner_image, poster_image, release_date, duration, genres, language, rating || 0.0, price_rent || 0.0, price_buy || 0.0, trailer_url];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ message: 'Stream added successfully', id: result.insertId });
  });
};

exports.updateStream = (req, res) => {
  const { id } = req.params;
  const { title, description, banner_image, poster_image, release_date, duration, genres, language, rating, price_rent, price_buy, trailer_url } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const query = `
    UPDATE streams 
    SET title=?, description=?, banner_image=?, poster_image=?, release_date=?, duration=?, genres=?, language=?, rating=?, price_rent=?, price_buy=?, trailer_url=?
    WHERE id=?
  `;
  const values = [title, description, banner_image, poster_image, release_date, duration, genres, language, rating || 0.0, price_rent || 0.0, price_buy || 0.0, trailer_url, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ message: 'Stream updated successfully' });
  });
};

exports.deleteStream = (req, res) => {
  db.query('DELETE FROM streams WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ message: 'Stream deleted' });
  });
};
