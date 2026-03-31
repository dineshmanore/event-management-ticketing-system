const { mongoose } = require('./mongo');

const MovieCastSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    role: { type: String, default: 'Unknown' },
    actorName: { type: String },
    actorImage: { type: String },
    mysqlActorId: { type: Number }
  },
  { _id: false }
);

const MovieSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    title: { type: String, required: true, trim: true },
    genre: { type: String },
    language: { type: String },
    rating: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    poster: { type: String },
    banner: { type: String },
    description: { type: String },
    category: { type: String },
    releaseDate: { type: Date },
    cast: [MovieCastSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
