const db = require('./models/db');
db.query('DESCRIBE bookings', (err, result) => {
  console.log(result);
  process.exit();
});
