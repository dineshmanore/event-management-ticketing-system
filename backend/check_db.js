const db = require('./models/db');
db.query('DESCRIBE movies', (err, result) => {
  console.log("MOVIES:\n", result);
  process.exit();
});
