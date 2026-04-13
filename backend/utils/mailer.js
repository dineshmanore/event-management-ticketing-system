const nodemailer = require('nodemailer');
const qrcode = require('qrcode');

const mailConfig = {
  auth: {
    user: (process.env.EMAIL_USER || '').trim(),
    pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
  },
  tls: {
    rejectUnauthorized: false
  },
  // Force IPv4 to avoid 'ENETUNREACH' issues on some cloud providers
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
};

const service = (process.env.EMAIL_SERVICE || '').toLowerCase();

if (service === 'gmail') {
  // Gmail on Render works best with port 587 + STARTTLS + Explicit Manual Config
  mailConfig.host = 'smtp.gmail.com';
  mailConfig.port = 587;
  mailConfig.secure = false; 
  mailConfig.requireTLS = true;
  mailConfig.connectionTimeout = 30000;
  mailConfig.greetingTimeout = 30000;
  mailConfig.socketTimeout = 30000;
} else if (service === 'brevo' || service === 'sendinblue') {
  mailConfig.host = 'smtp-relay.brevo.com';
  mailConfig.port = 587;
  mailConfig.secure = false;
} else if (service) {
  mailConfig.service = service;
} else {
  mailConfig.host = process.env.EMAIL_HOST || 'smtp.ethereal.email';
  mailConfig.port = parseInt(process.env.EMAIL_PORT || 587);
  mailConfig.secure = mailConfig.port === 465;
}

const transporter = nodemailer.createTransport(mailConfig);

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// Diagnostic function for API
exports.verifyConnection = async () => {
  if (process.env.EMAIL_SERVICE === 'brevo' || process.env.EMAIL_SERVICE === 'sendinblue') {
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': (process.env.EMAIL_PASS || '').replace(/\s/g, '') }
      });
      if (response.ok) return { success: true, user: process.env.EMAIL_USER, mode: 'API' };
      const err = await response.json();
      return { success: false, error: err.message || 'API Key Invalid' };
    } catch (e) {
      return { success: false, error: 'API Connection Failed: ' + e.message };
    }
  }
  try {
    await transporter.verify();
    return { success: true, user: process.env.EMAIL_USER, mode: 'SMTP' };
  } catch (err) {
    return { success: false, error: err.message, code: err.code };
  }
};

async function sendViaBrevoApi(mailOptions) {
  const apiKey = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
  const senderEmail = process.env.EMAIL_USER || 'no-reply@showtime.com';
  
  // Convert Nodemailer options to Brevo API format
  const body = {
    sender: { name: "ShowTime", email: senderEmail },
    to: [{ email: mailOptions.to, name: mailOptions.toName || mailOptions.to }],
    subject: mailOptions.subject,
    htmlContent: mailOptions.html,
  };

  if (mailOptions.attachments && mailOptions.attachments.length > 0) {
    body.attachment = mailOptions.attachments.map(att => ({
      name: att.filename,
      content: att.content.toString('base64')
    }));
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Brevo API Error');
  }
  return await res.json();
}

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/verify.html?token=${token}`;
  const html = `
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
  `;

  try {
    if (process.env.EMAIL_SERVICE === 'brevo' || process.env.EMAIL_SERVICE === 'sendinblue') {
      await sendViaBrevoApi({ to: email, toName: name, subject: 'Verify Your Email - ShowTime', html });
    } else {
      await transporter.sendMail({ from: `"ShowTime" <${process.env.EMAIL_USER || 'no-reply@showtime.com'}>`, to: email, subject: 'Verify Your Email - ShowTime', html });
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

exports.sendBookingConfirmation = async (email, name, booking) => {
  try {
    const qrData = JSON.stringify({ id: booking.id, user: name, item: booking.title, seats: booking.seats, date: booking.date });
    const qrCodeBuffer = await qrcode.toBuffer(qrData);
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background-color: #ff385c; color: white; display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 24px;">ST</div>
          <h1 style="color: #333; margin-top: 15px; font-size: 22px;">Booking Confirmation</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #ff385c;">
          <p style="margin: 0; color: #666; font-size: 14px;">Hi ${name},</p>
          <h2 style="margin: 5px 0 0 0; color: #333; font-size: 18px;">Your tickets are ready!</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #777;">Booking ID</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold; text-align: right;">#${booking.id}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #777;">Show / Event</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold; text-align: right;">${booking.title}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #777;">Date</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold; text-align: right;">${booking.date}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #777;">Seats</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold; text-align: right;">${booking.seats}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #777;">Total Paid</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #ff385c; font-weight: bold; text-align: right;">₹${booking.price}</td></tr>
        </table>
        <div style="text-align: center; border: 2px dashed #ff385c; padding: 25px; border-radius: 12px; background-color: #fff9fa;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #333;">Your Entry QR Code</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" alt="QR Code" style="width: 180px; height: 180px;" />
        </div>
      </div>
    `;

    if (process.env.EMAIL_SERVICE === 'brevo' || process.env.EMAIL_SERVICE === 'sendinblue') {
      await sendViaBrevoApi({ to: email, toName: name, subject: `Booking Confirmed: ${booking.title} - ShowTime`, html });
    } else {
      const mailOptions = {
        from: `"ShowTime" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'bookings@showtime.com'}>`,
        to: email, subject: `Booking Confirmed: ${booking.title} - ShowTime`, html,
        attachments: [{ filename: 'ticket_qr.png', content: qrCodeBuffer, cid: 'ticket_qr' }]
      };
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
};

exports.sendEmailChangeVerification = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/verify-email.html?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ff385c;">Update Your Email, ${name}!</h2>
      <p>Please click the button below to confirm this change:</p>
      <div style="text-align: center; margin: 30px 0;"><a href="${url}" style="background-color: #ff385c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm New Email</a></div>
    </div>
  `;
  try {
    if (process.env.EMAIL_SERVICE === 'brevo' || process.env.EMAIL_SERVICE === 'sendinblue') {
      await sendViaBrevoApi({ to: email, toName: name, subject: 'Confirm Your New Email - ShowTime', html });
    } else {
      await transporter.sendMail({ from: `"ShowTime" <${process.env.EMAIL_USER || 'no-reply@showtime.com'}>`, to: email, subject: 'Confirm Your New Email - ShowTime', html });
    }
  } catch (error) {
    console.error('Error sending email change verification:', error);
  }
};
