const db = require('./models/db');
db.query('SHOW TABLES', (err, result) => {
  console.log("Tables:");
  console.log(result);
  process.exit();
});
