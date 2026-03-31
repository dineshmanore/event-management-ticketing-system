const db = require('../models/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })

  const hash = bcrypt.hashSync(password, 8)

  db.query(
    'INSERT INTO users(name, email, password) VALUES(?, ?, ?)',
    [name, email, hash],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ message: 'Email already registered' })
        return res.status(500).json({ message: 'Database error' })
      }
      res.json({ message: 'User created' })
    }
  )
}

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = result[0];

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });

    // 🔥 INCLUDE ROLE IN TOKEN
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'showtime_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role   // 🔥 MUST
      }
    });
  });
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

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (result.length > 0) {
        // User exists, login
        const user = result[0];
        const jwtToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET || 'showtime_secret',
          { expiresIn: '7d' }
        );
        return res.json({
          token: jwtToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      } else {
        // Create new user with random password
        const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-8);
        const hash = bcrypt.hashSync(randomPassword, 8);

        db.query(
          'INSERT INTO users(name, email, password) VALUES(?, ?, ?)',
          [name || 'Google User', email, hash],
          (insertErr, insertResult) => {
            if (insertErr) return res.status(500).json({ message: 'Database error during signup' });
            
            const newUserId = insertResult.insertId;
            const jwtToken = jwt.sign(
              { id: newUserId, role: 'user' },
              process.env.JWT_SECRET || 'showtime_secret',
              { expiresIn: '7d' }
            );

            res.json({
              token: jwtToken,
              user: { id: newUserId, name: name || 'Google User', email, role: 'user' }
            });
          }
        );
      }
    });

  } catch (err) {
    console.error('Google verification error:', err);
    res.status(401).json({ message: 'Invalid or expired Google token' });
  }
};