const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env!");
  process.exit(1);
}

// Minimal User Schema for Migration
const UserSchema = new mongoose.Schema({
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
});

const User = mongoose.model('User', UserSchema);

async function migrate() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    console.log("Updating existing users to isVerified: true...");
    
    // Update all users who don't have isVerified set to true
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true }, $unset: { verificationToken: "" } }
    );

    console.log(`✅ Migration Complete! Updated ${result.modifiedCount} users.`);
    console.log("All existing users are now marked as verified.");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
