const dotenv = require('dotenv');
dotenv.config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const sendEmail = require('../services/emailService');
const sendSMS = require('../services/smsService');
const sendInApp = require('../services/inAppService');
const { pushToQueue, connectQueue } = require('../queues/notificationQueue');


const queue = 'notifications';

const startWorker = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Worker connected to MongoDB');

    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log('Worker connected to RabbitMQ');

    await connectQueue();

    channel.consume(queue, async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const { notificationId, retryCount = 0 } = data;

      console.log(`Processing notification ID: ${notificationId}, Retry: ${retryCount}`);

      let notification;

      try {
        notification = await Notification.findById(notificationId);
        if (!notification) throw new Error('Notification not found');

        let result;

        if (notification.type === 'email') {
          await sendEmail(notification);
        } 
        else if (notification.type === 'sms') {
          result = await sendSMS(notification);
          if (result?.skipped) {
            notification.status = 'skipped';
            await notification.save();
            console.warn(`Notification ${notification._id} skipped (SMS limit or unverified)`);
            channel.ack(msg);
            return;
          }
        } 
        else if (notification.type === 'in-app') {
          await sendInApp(notification);
        }

        notification.status = 'sent';
        await notification.save();
        console.log(`Notification ${notification._id} sent`);

        channel.ack(msg);

      } 
      catch (err) {
        console.error(`Failed to process ${notificationId}: ${err.message}`);

        if (retryCount < 3) {
          const newRetryCount = retryCount + 1;
          console.log(`Retrying (attempt ${newRetryCount}/3)...`);

          await pushToQueue(queue, { notificationId, retryCount: newRetryCount }, 5000);

        } 
        else {
          console.log(`Final failure. Giving up on notification ${notificationId}`);
          if (notification) {
            notification.status = 'failed';
            await notification.save();
          }
        }

        channel.ack(msg);
      }
    });

  } 
  catch (error) {
    console.error('Worker failed to start:', error.message);
  }
};

startWorker();
