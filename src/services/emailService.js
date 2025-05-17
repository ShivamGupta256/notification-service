const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (notification) => {
  const mailOptions = {
    from: `"Notification Service" <${process.env.EMAIL_USER}>`,
    to: notification.to,
    subject: notification.subject || 'Notification',
    text: notification.message,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${notification.to}`);
};

module.exports = sendEmail;
