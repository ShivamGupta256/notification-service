const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const VERIFIED_NUMBER = process.env.TWILIO_VERIFIED_TO;
const MAX_SMS_SENDS = 1;

let smsSendCount = 0;

const sendSMS = async (notification) => {
  const target = notification.to;

  if (target === VERIFIED_NUMBER) {
    console.log(`Sending to verified number: ${target}`);
  } else if (smsSendCount < MAX_SMS_SENDS) {
    smsSendCount++;
    console.log(`Sending to ${target} (allowed, count: ${smsSendCount}/${MAX_SMS_SENDS})`);
  } else {
    console.warn(`SMS limit reached. Skipping send to ${target}`);
    return { skipped: true };
  }

  await client.messages.create({
    body: notification.message,
    from: process.env.TWILIO_PHONE,
    to: target,
  });

  console.log(`SMS sent to ${target}`);
  return { success: true };
};

module.exports = sendSMS;