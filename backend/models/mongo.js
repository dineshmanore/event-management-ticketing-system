require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || 'showtime';

function uriHasDbName(uri) {
  if (!uri) return false;
  const withoutQuery = uri.split('?')[0];
  const slashIdx = withoutQuery.lastIndexOf('/');
  if (slashIdx < 0) return false;
  const dbPart = withoutQuery.slice(slashIdx + 1);
  return !!dbPart;
}

async function connectMongo() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  const options = {
    serverSelectionTimeoutMS: 15000
  };

  // If URI has no explicit DB path, Mongoose defaults to "test".
  if (!uriHasDbName(mongoUri)) {
    options.dbName = mongoDbName;
  }

  await mongoose.connect(mongoUri, options);

  const activeDb = mongoose.connection?.name || mongoDbName;
  console.log(`MongoDB active database: ${activeDb}`);
}

module.exports = { mongoose, connectMongo };
