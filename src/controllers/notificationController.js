const Notification = require('../models/Notification');
const { pushToQueue } = require('../queues/notificationQueue');

const sendNotification = async (req, res) => {
  try {
    const notifications = req.body.notifications;

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
      savedNotifications,
    });

  } 
  catch (error) {
    console.error('Error sending notification:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    const type = req.query.type;

    const filter = { userId };
    if (type && ['email', 'sms', 'in-app'].includes(type)) {
      filter.type = type;
    }

    console.log('Filter being applied:', filter);

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } 
  catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { sendNotification, getUserNotifications };