require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
  });

  try {
    console.log('Starting migration...');

    // 1. Add release_date to movies if it doesn't exist
    try {
      await db.query(`ALTER TABLE movies ADD COLUMN release_date DATE`);
      console.log('Added release_date column to movies table.');
    } catch (err) {
       // if column exists, ignore
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('release_date column already exists.');
      } else {
        throw err;
      }
    }

    // 2. Populate missing release_date with a randomly generated date in the last 6 months
    const [movies] = await db.query(`SELECT id FROM movies WHERE release_date IS NULL`);
    for (const movie of movies) {
       // Random date 1 to 180 days ago
       const randomDays = Math.floor(Math.random() * 180);
       const date = new Date();
       date.setDate(date.getDate() - randomDays);
       const dateString = date.toISOString().split('T')[0];
       await db.query(`UPDATE movies SET release_date = ? WHERE id = ?`, [dateString, movie.id]);
    }
    if (movies.length > 0) {
      console.log(`Populated release_date for ${movies.length} existing movies.`);
    }

    // 3. Create streams table
    const createStreamQuery = `
      CREATE TABLE IF NOT EXISTS streams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        banner_image VARCHAR(500),
        poster_image VARCHAR(500),
        release_date DATE,
        duration INT,
        genres VARCHAR(255),
        language VARCHAR(100),
        rating DECIMAL(3,1) DEFAULT 0.0,
        price_rent DECIMAL(10,2) DEFAULT 0.00,
        price_buy DECIMAL(10,2) DEFAULT 0.00,
        trailer_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(createStreamQuery);
    console.log('streams table created successfully.');

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.end();
  }
}

migrate();
