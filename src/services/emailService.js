const sendEmail = async (notification) => {
  console.log(`[Mock] Sending Email to ${notification.to}: ${notification.subject}`);
};

module.exports = sendEmail;
