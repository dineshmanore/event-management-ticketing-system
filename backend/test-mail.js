const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("--------------------------------------------------");
console.log("📧 TESTING GMAIL SMTP CONNECTION...");
console.log("Email:", process.env.EMAIL_USER);
console.log("--------------------------------------------------");

transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Connection Error Detected!");
    console.log("Error Details:", error.message);
    if (error.message.includes('auth')) {
        console.log("\n💡 Possible Fix: Check your Gmail Address and App Password.");
    }
  } else {
    console.log("✅ SUCCESS: Server is ready to send verification emails!");
  }
  process.exit(0);
});
