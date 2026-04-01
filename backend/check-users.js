const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, name: String, isVerified: Boolean }));
    
    const users = await User.find({}).select('email name isVerified').lean();
    
    console.log("--------------------------------------------------");
    console.log(`TOTAL USERS IN DATABASE: ${users.length}`);
    console.log("--------------------------------------------------");
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. [${u.isVerified ? 'VERIFIED' : 'PENDING'}] ${u.name} (${u.email})`);
    });
    
    console.log("--------------------------------------------------");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
