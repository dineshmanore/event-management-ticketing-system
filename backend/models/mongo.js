require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

async function connectMongo() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000
  });
}

module.exports = { mongoose, connectMongo };
