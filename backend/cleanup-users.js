const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const EMAILS_TO_KEEP = ['dinesh442006@gmail.com', 'admin@gmail.com'];

async function cleanup() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    const User = mongoose.model('User', new mongoose.Schema({ email: String }));

    console.log(`Cleaning up users... keeping only: ${EMAILS_TO_KEEP.join(', ')}`);
    
    // Delete all users EXCEPT those in our keep list
    const result = await User.deleteMany({
      email: { $nin: EMAILS_TO_KEEP }
    });

    console.log(`✅ Cleanup Complete! Deleted ${result.deletedCount} users.`);
    console.log("Remaining users in database:");
    
    const remaining = await User.find({}).select('email').lean();
    remaining.forEach((u, i) => console.log(`${i+1}. ${u.email}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
}

cleanup();
