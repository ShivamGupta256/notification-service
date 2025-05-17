const Notification = require('../models/Notification');
const { pushToQueue } = require('../queues/notificationQueue');

const sendNotification = async (req, res) => {
  try {
    const notifications = req.body.notifications;

    // ✅ Declare it before the loop
    const savedNotifications = [];

    for (const note of notifications) {
      const notification = new Notification({
        userId: req.body.userId,
        type: note.type,
        to: note.to,
        subject: note.subject,
        message: note.message,
        status: 'pending',
      });

      const saved = await notification.save();
      savedNotifications.push(saved);

      await pushToQueue('notifications', {
        notificationId: saved._id,
      });
    }

    res.status(201).json({
      message: 'Notifications queued',
      savedNotifications, // ✅ Now accessible
    });

  } catch (error) {
    console.error('Error sending notification:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { sendNotification };