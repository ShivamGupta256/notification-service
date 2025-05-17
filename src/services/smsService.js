const sendSMS = async (notification) => {
  console.log(`[Mock] Sending SMS to ${notification.to}: ${notification.message}`);
};

module.exports = sendSMS;
