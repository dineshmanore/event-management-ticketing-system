const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User.mongo')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hash = bcrypt.hashSync(password, 8);

  User.create({ name, email, password: hash, role: 'user' })
    .then(() => res.json({ message: 'User created' }))
    .catch((err) => {
      if (err && err.code === 11000) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      return res.status(500).json({ message: 'Database error' });
    });
}

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  User.findOne({ email: String(email).toLowerCase().trim() })
    .then((user) => {
      if (!user) return res.status(404).json({ message: 'User not found' });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Incorrect password' });

      const token = jwt.sign(
        { id: String(user._id), role: user.role },
        process.env.JWT_SECRET || 'showtime_secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    })
    .catch(() => res.status(500).json({ message: 'Database error' }));
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Google token is required' });

  try {
    // We pass the token without verifying the audience strictly if using a placeholder, 
    // but in production it aligns with GOOGLE_CLIENT_ID.
    // If the token is fake (for testing without a real client ID), it will throw.
    // For this implementation we will catch the error, but still support the real flow.
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Very basic fallback if a user sends a fake token because they have no Client ID yet.
      // Do NOT do this in production.
      if (process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        payload = jwt.decode(token); 
      } else {
        throw verifyErr;
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name } = payload;

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (existing) {
      const jwtToken = jwt.sign(
        { id: String(existing._id), role: existing.role },
        process.env.JWT_SECRET || 'showtime_secret',
        { expiresIn: '7d' }
      );
      return res.json({
        token: jwtToken,
        user: { id: String(existing._id), name: existing.name, email: existing.email, role: existing.role }
      });
    }

    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-8);
    const hash = bcrypt.hashSync(randomPassword, 8);
    const created = await User.create({
      name: name || 'Google User',
      email: String(email).toLowerCase().trim(),
      password: hash,
      role: 'user'
    });

    const jwtToken = jwt.sign(
      { id: String(created._id), role: 'user' },
      process.env.JWT_SECRET || 'showtime_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token: jwtToken,
      user: { id: String(created._id), name: created.name, email: created.email, role: created.role }
    });

  } catch (err) {
    console.error('Google verification error:', err);
    res.status(401).json({ message: 'Invalid or expired Google token' });
  }
};