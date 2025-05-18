/*const sendSMS = async (notification) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[Mock] SMS sent to ${notification.to}: ${notification.message}`);
};

module.exports = sendSMS;
*/

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (notification) => {

  //throw new Error('Simulated failure');  // This line is only for testing the retry feature.

  await client.messages.create({
    body: notification.message,
    from: process.env.TWILIO_PHONE,
    to: notification.to,
  });

  console.log(`SMS sent to ${notification.to}`);
};

module.exports = sendSMS;