const { mongoose } = require('./mongo');

const StreamSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    bannerImage: { type: String },
    posterImage: { type: String },
    releaseDate: { type: Date },
    duration: { type: Number },
    genres: { type: String },
    language: { type: String },
    rating: { type: Number, default: 0 },
    priceRent: { type: Number, default: 0 },
    priceBuy: { type: Number, default: 0 },
    trailerUrl: { type: String },
    status: { type: String, default: 'active' },
    category: { type: String, default: 'Stream' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Stream || mongoose.model('Stream', StreamSchema);
