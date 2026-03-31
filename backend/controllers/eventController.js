const db = require('../models/db')

exports.getEvents = (req, res) => {
  const category = req.query.category;
  let q = 'SELECT * FROM events WHERE status = "active"';
  let params = [];
  if (category) {
    q += ' AND category = ?';
    params.push(category);
  }
  q += ' ORDER BY date ASC';

  db.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(result);
  });
}

exports.getEventById = (req, res) => {
  db.query('SELECT * FROM events WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    if (!result.length) return res.status(404).json({ message: 'Not found' })
    res.json(result[0])
  })
}

exports.addEvent = (req, res) => {
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })
  db.query(
    'INSERT INTO events (title,category,venue,city,date,time,price_from,price_to,image,banner,description,language,age_limit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [title, category, venue, city, date, time, price_from||0, price_to||0, image, banner, description, language, age_limit||'All Ages'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })
      res.json({ message: 'Event added', id: result.insertId })
    }
  )
}

exports.updateEvent = (req, res) => {
  const { id } = req.params
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit, status } = req.body
  db.query(
    'UPDATE events SET title=?,category=?,venue=?,city=?,date=?,time=?,price_from=?,price_to=?,image=?,banner=?,description=?,language=?,age_limit=?,status=? WHERE id=?',
    [title, category, venue, city, date, time, price_from||0, price_to||0, image, banner, description, language, age_limit, status||'active', id],
    (err) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message })
      res.json({ message: 'Event updated' })
    }
  )
}

exports.deleteEvent = (req, res) => {
  db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json({ message: 'Event deleted' })
  })
}
