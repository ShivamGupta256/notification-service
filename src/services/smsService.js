const sendSMS = async (notification) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[Mock] SMS sent to ${notification.to}: ${notification.message}`);
};

module.exports = sendSMS;
