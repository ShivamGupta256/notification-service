const Notification = require("../models/Notification");
const { pushToQueue } = require("../queues/notificationQueue");

const sendNotification = async (req, res) => {
    try {
        const notification = req.body.notifications;
        const savedNotification = [];

        for(const note of notification) {
            const notification = new Notification({
                userId: req.body.userId,
                type: note.type,
                to: note.to,
                subject: note.subject,
                message,
                status: "pending"
            });

            const saved = await notification.save();
            savedNotifications.push(saved);

            await pushToQueue("notifications", {
                notificationId: saved._id,
            });
        }

        res.status(201).json({message: "Notifications queued", savedNotifications});
    }
    catch(error) {
        console.error("Error sending notification: ",error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

module.exports = { sendNotification };