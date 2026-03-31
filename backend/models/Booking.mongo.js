const { mongoose } = require('./mongo');

const BookingSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    seats: { type: String, required: true },
    totalPrice: { type: Number, default: 0 },
    showDate: { type: String },
    bookingTimeLegacy: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
