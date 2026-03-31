const db = require('./models/db');

// Execute an ALTER TABLE
db.query(
  "ALTER TABLE bookings ADD COLUMN show_date VARCHAR(50) DEFAULT '2026-03-31';",
  (err, result) => {
    if (err && err.code === 'ER_DUP_FIELDNAME') {
      console.log("show_date column already exists.");
      process.exit(0);
    } else if (err) {
      console.error("Migration failed:", err);
      process.exit(1);
    } else {
      console.log("show_date column added successfully.");
      process.exit(0);
    }
  }
);
