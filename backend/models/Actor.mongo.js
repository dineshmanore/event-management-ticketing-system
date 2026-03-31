const { mongoose } = require('./mongo');

const ActorSchema = new mongoose.Schema(
  {
    mysqlId: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    image: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Actor || mongoose.model('Actor', ActorSchema);
