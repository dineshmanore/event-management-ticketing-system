const Event = require('../models/Event.mongo')
const { buildIdQuery, addLegacyId } = require('../utils/id')

exports.getEvents = (req, res) => {
  const category = req.query.category;
  const filter = { status: 'active' };
  if (category) filter.category = category;

  Event.find(filter)
    .sort({ date: 1 })
    .lean()
    .then((docs) => {
      const mapped = docs.map((d) => {
        const out = addLegacyId(d);
        out.price_from = d.priceFrom ?? 0;
        out.price_to = d.priceTo ?? 0;
        out.age_limit = d.ageLimit ?? 'All Ages';
        return out;
      });
      res.json(mapped);
    })
    .catch(() => res.status(500).json({ message: 'DB error' }));
}

exports.getEventById = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Event.findOne(q)
    .lean()
    .then((d) => {
      if (!d) return res.status(404).json({ message: 'Not found' });
      const out = addLegacyId(d);
      out.price_from = d.priceFrom ?? 0;
      out.price_to = d.priceTo ?? 0;
      out.age_limit = d.ageLimit ?? 'All Ages';
      res.json(out);
    })
    .catch(() => res.status(500).json({ message: 'DB error' }));
}

exports.addEvent = (req, res) => {
  const { title, category, venue, city, date, time, price_from, price_to, image, banner, description, language, age_limit } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })
  Event.create({
    title,
    category: category || 'event',
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
    status: 'active'
  })
    .then((doc) => res.json({ message: 'Event added', id: doc.mysqlId ?? String(doc._id) }))
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }))
}

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
        ageLimit: age_limit,
        status: status || 'active'
      }
    },
    { new: true }
  )
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Event updated' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }));
}

exports.deleteEvent = (req, res) => {
  const q = buildIdQuery(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });

  Event.findOneAndDelete(q)
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Event deleted' });
    })
    .catch((err) => res.status(500).json({ message: 'DB error', error: err.message }));
}
