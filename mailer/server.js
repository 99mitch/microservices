const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors') // Add this

const app = express();
app.use(cors()) // Enable CORS

app.use(bodyParser.json());

// Create a Nodemailer transporter for Postfix
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'maildev', // Use the SMTP_HOST environment variable
  port: parseInt(process.env.SMTP_PORT, 10) || 1025, // Use the SMTP_PORT environment variable
  secure: false, // MailDev does not use TLS
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});



// Define mail templates
const mailTemplates = {
  passwordReset: {
    subject: 'Password Reset Request',
    body: (email) =>
      `Hello,\n\nA request has been received to reset your password for the account associated with ${email}.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYour Team`,
  },
  encodingComplete: {
    subject: 'Your Video Encoding is Complete',
    body: () =>
      `Hello,\n\nYour video encoding process has successfully completed.\n\nThank you for using our service!\n\nBest regards,\nYour Team`,
  },
};

// API to send mail
app.post('/send-mail', async (req, res) => {
  const { email, type } = req.body;

  if (!email || !type || !mailTemplates[type]) {
    return res.status(400).send({
      error: 'Invalid email or mail type. Valid types: passwordReset, encodingComplete',
    });
  }

  const { subject, body } = mailTemplates[type];
  try {
    await transporter.sendMail({
      from: 'noreply@example.com', // Change to your email address
      to: email,
      subject,
      text: body(email),
    });
    res.status(200).send({ message: 'Mail sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to send email' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'Mailer Service is running' });
});

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Mailer service is running on port ${PORT}`);
});
