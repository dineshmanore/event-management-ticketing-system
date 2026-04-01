const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER || 'placeholder@example.com',
    pass: process.env.EMAIL_PASS || 'placeholder_pass',
  },
});

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/verify.html?token=${token}`;

  const mailOptions = {
    from: `"ShowTime" <${process.env.EMAIL_USER || 'no-reply@showtime.com'}>`,
    to: email,
    subject: 'Verify Your Email - ShowTime',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff385c;">Welcome to ShowTime, ${name}!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #ff385c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    // If using Ethereal, log the preview URL
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};
