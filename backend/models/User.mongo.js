const { mongoose } = require('./mongo');

const UserSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAtLegacy: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
