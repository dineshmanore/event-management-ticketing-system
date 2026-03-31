const db = require('./models/db');

db.query('DROP TABLE IF EXISTS admins', (err, result) => {
  if (err) {
    console.error('Error dropping admins table:', err);
    process.exit(1);
  } else {
    console.log('Unused admins table dropped successfully.');
    process.exit(0);
  }
});
