const sendInApp = async (notification) => {

  //throw new Error('Simulated failure');  // This line is only for testing the retry feature.

  console.log(`[In-App] Stored message: ${notification.message}`);
};

module.exports = sendInApp;
