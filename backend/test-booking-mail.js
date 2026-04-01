require('dotenv').config();
const { sendBookingConfirmation } = require('./utils/mailer');

const testBooking = {
    id: 'TEST123456',
    title: 'Deadpool & Wolverine',
    date: '2024-04-01',
    seats: 'A1, A2',
    price: 1000
};

console.log("--------------------------------------------------");
console.log("📧 SENDING TEST BOOKING EMAIL TO:", process.env.EMAIL_USER);
console.log("--------------------------------------------------");

sendBookingConfirmation(process.env.EMAIL_USER, 'Dinesh', testBooking)
    .then(() => {
        console.log("✅ Email logic completed. Check your inbox (and Spam folder)!");
        setTimeout(() => process.exit(0), 2000);
    })
    .catch(err => {
        console.log("❌ Failed to send email:", err);
        process.exit(1);
    });
