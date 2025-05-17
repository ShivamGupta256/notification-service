// src/workers/notificationWorker.js
const amqp = require('amqplib');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('../models/Notification');
const sendEmail = require('../services/emailService');
const sendSMS = require('../services/smsService');
const sendInApp = require('../services/inAppService');

dotenv.config();

const queue = 'notifications';

const startWorker = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Worker connected to MongoDB');

    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log('Worker connected to RabbitMQ');

    channel.consume(queue, async (msg) => {
      const { notificationId } = JSON.parse(msg.content.toString());
      console.log(`Processing notification ID: ${notificationId}`);

      try {
        const notification = await Notification.findById(notificationId);
        if (!notification) throw new Error('Notification not found');

        if (notification.type === 'email') {
          await sendEmail(notification);
        } else if (notification.type === 'sms') {
          await sendSMS(notification);
        } else if (notification.type === 'in-app') {
          await sendInApp(notification);
        }

        notification.status = 'sent';
        await notification.save();
        console.log(`Notification ${notification._id} sent`);

        channel.ack(msg);
      } catch (err) {
        console.error(`Failed to process notification ${notificationId}:`, err.message);
        notification.status = 'failed';
        await notification.save();
        channel.ack(msg);
      }

    }, { noAck: false });

  } catch (error) {
    console.error('Worker failed to start:', error.message);
  }
};

startWorker();
