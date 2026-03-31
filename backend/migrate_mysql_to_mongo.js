require('dotenv').config();
const mysql = require('mysql2/promise');
const { connectMongo, mongoose } = require('./models/mongo');

const User = require('./models/User.mongo');
const Actor = require('./models/Actor.mongo');
const Movie = require('./models/Movie.mongo');
const Event = require('./models/Event.mongo');
const Stream = require('./models/Stream.mongo');
const Booking = require('./models/Booking.mongo');

function toDateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query('SHOW TABLES LIKE ?', [tableName]);
  return rows.length > 0;
}

async function loadAll(conn, query, params = []) {
  const [rows] = await conn.query(query, params);
  return rows;
}

async function migrateUsers(conn) {
  const users = await loadAll(conn, 'SELECT * FROM users');
  const mysqlToMongoUserId = new Map();

  for (const row of users) {
    const doc = await User.findOneAndUpdate(
      { mysqlId: row.id },
      {
        $set: {
          mysqlId: row.id,
          name: row.name || 'User',
          email: row.email,
          password: row.password || '',
          role: row.role || 'user',
          createdAtLegacy: toDateSafe(row.created_at)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mysqlToMongoUserId.set(row.id, doc._id);
  }

  return { count: users.length, mysqlToMongoUserId };
}

async function migrateActors(conn) {
  const exists = await tableExists(conn, 'actors');
  if (!exists) return { count: 0, mysqlToMongoActorId: new Map() };

  const actors = await loadAll(conn, 'SELECT * FROM actors');
  const mysqlToMongoActorId = new Map();

  for (const row of actors) {
    const doc = await Actor.findOneAndUpdate(
      { mysqlId: row.id },
      { $set: { mysqlId: row.id, name: row.name || 'Unknown', image: row.image || '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mysqlToMongoActorId.set(row.id, doc._id);
  }

  return { count: actors.length, mysqlToMongoActorId };
}

async function migrateMovies(conn, mysqlToMongoActorId) {
  const movies = await loadAll(conn, 'SELECT * FROM movies');
  const mysqlToMongoMovieId = new Map();

  let movieCastRows = [];
  const hasMovieCast = await tableExists(conn, 'movie_cast');
  if (hasMovieCast) {
    movieCastRows = await loadAll(
      conn,
      `SELECT mc.movie_id, mc.actor_id, mc.role, a.name AS actor_name, a.image AS actor_image
       FROM movie_cast mc
       LEFT JOIN actors a ON a.id = mc.actor_id`
    );
  }

  const castByMovie = new Map();
  for (const row of movieCastRows) {
    if (!castByMovie.has(row.movie_id)) castByMovie.set(row.movie_id, []);
    castByMovie.get(row.movie_id).push({
      actor: mysqlToMongoActorId.get(row.actor_id) || null,
      role: row.role || 'Unknown',
      actorName: row.actor_name || null,
      actorImage: row.actor_image || null,
      mysqlActorId: row.actor_id || null
    });
  }

  for (const row of movies) {
    const doc = await Movie.findOneAndUpdate(
      { mysqlId: row.id },
      {
        $set: {
          mysqlId: row.id,
          title: row.title || 'Untitled',
          genre: row.genre || '',
          language: row.language || '',
          rating: Number(row.rating || 0),
          votes: Number(row.votes || 0),
          poster: row.poster || '',
          banner: row.banner || '',
          description: row.description || '',
          category: row.category || '',
          releaseDate: toDateSafe(row.release_date),
          cast: castByMovie.get(row.id) || []
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mysqlToMongoMovieId.set(row.id, doc._id);
  }

  return { count: movies.length, mysqlToMongoMovieId };
}

async function migrateEvents(conn) {
  const events = await loadAll(conn, 'SELECT * FROM events');
  const mysqlToMongoEventId = new Map();

  for (const row of events) {
    const doc = await Event.findOneAndUpdate(
      { mysqlId: row.id },
      {
        $set: {
          mysqlId: row.id,
          title: row.title || 'Untitled Event',
          category: row.category || 'event',
          venue: row.venue || '',
          city: row.city || '',
          date: toDateSafe(row.date),
          time: row.time || '',
          priceFrom: Number(row.price_from || 0),
          priceTo: Number(row.price_to || 0),
          image: row.image || '',
          banner: row.banner || '',
          description: row.description || '',
          language: row.language || '',
          ageLimit: row.age_limit || 'All Ages',
          status: row.status || 'active'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mysqlToMongoEventId.set(row.id, doc._id);
  }

  return { count: events.length, mysqlToMongoEventId };
}

async function migrateStreams(conn) {
  const exists = await tableExists(conn, 'streams');
  if (!exists) return { count: 0 };

  const streams = await loadAll(conn, 'SELECT * FROM streams');
  for (const row of streams) {
    await Stream.findOneAndUpdate(
      { mysqlId: row.id },
      {
        $set: {
          mysqlId: row.id,
          title: row.title || 'Untitled Stream',
          description: row.description || '',
          bannerImage: row.banner_image || '',
          posterImage: row.poster_image || '',
          releaseDate: toDateSafe(row.release_date),
          duration: row.duration ? Number(row.duration) : null,
          genres: row.genres || '',
          language: row.language || '',
          rating: Number(row.rating || 0),
          priceRent: Number(row.price_rent || 0),
          priceBuy: Number(row.price_buy || 0),
          trailerUrl: row.trailer_url || '',
          status: row.status || 'active'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return { count: streams.length };
}

async function migrateBookings(conn, userMap, movieMap, eventMap) {
  const bookings = await loadAll(conn, 'SELECT * FROM bookings');

  for (const row of bookings) {
    const seats = String(row.seats || '');
    const isEventBooking = seats.toLowerCase().includes('general');
    const userId = userMap.get(row.user_id);
    if (!userId) continue;

    await Booking.findOneAndUpdate(
      { mysqlId: row.id },
      {
        $set: {
          mysqlId: row.id,
          user: userId,
          movie: isEventBooking ? null : (movieMap.get(row.movie_id) || null),
          event: isEventBooking ? (eventMap.get(row.movie_id) || null) : null,
          seats,
          totalPrice: Number(row.total_price || 0),
          showDate: row.show_date || null,
          bookingTimeLegacy: toDateSafe(row.booking_time)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return { count: bookings.length };
}

async function main() {
  let mysqlConn;
  try {
    mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306)
    });

    await connectMongo();
    console.log('Connected to MySQL and MongoDB');

    const usersRes = await migrateUsers(mysqlConn);
    const actorsRes = await migrateActors(mysqlConn);
    const moviesRes = await migrateMovies(mysqlConn, actorsRes.mysqlToMongoActorId);
    const eventsRes = await migrateEvents(mysqlConn);
    const streamsRes = await migrateStreams(mysqlConn);
    const bookingsRes = await migrateBookings(
      mysqlConn,
      usersRes.mysqlToMongoUserId,
      moviesRes.mysqlToMongoMovieId,
      eventsRes.mysqlToMongoEventId
    );

    const mongoCounts = {
      users: await User.countDocuments(),
      actors: await Actor.countDocuments(),
      movies: await Movie.countDocuments(),
      events: await Event.countDocuments(),
      streams: await Stream.countDocuments(),
      bookings: await Booking.countDocuments()
    };

    console.log('\nMigration complete.');
    console.log('Imported from MySQL:', {
      users: usersRes.count,
      actors: actorsRes.count,
      movies: moviesRes.count,
      events: eventsRes.count,
      streams: streamsRes.count,
      bookings: bookingsRes.count
    });
    console.log('Current Mongo counts:', mongoCounts);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (mysqlConn) await mysqlConn.end();
    await mongoose.disconnect();
  }
}

main();
