const { mongoose } = require('./mongo');

const EventSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'concert' },
    venue: { type: String },
    city: { type: String },
    date: { type: Date },
    time: { type: String },
    priceFrom: { type: Number, default: 0 },
    priceTo: { type: Number, default: 0 },
    image: { type: String },
    banner: { type: String },
    description: { type: String },
    language: { type: String },
    ageLimit: { type: String, default: 'All Ages' },
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
