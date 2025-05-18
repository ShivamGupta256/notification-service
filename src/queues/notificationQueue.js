const ampq = require("amqplib");
const queueName = "notifications";

let channel;

const connectQueue = async () => {
    try {
        const connection = await ampq.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        console.log("Connected to RabbitMQ & queue ready");
    }
    catch(error) {
        console.log("Failed toconnect to RabbitMQ: ",error.message);
    }
};

const pushToQueue = async (queueName, message, delayMs = 0) => {
  try {
    if (!channel) throw new Error('No channel connected yet');

    const buffer = Buffer.from(JSON.stringify(message));

    if (delayMs > 0) {
      const delayedQueue = `${queueName}_delayed`;
      await channel.assertQueue(delayedQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queueName,
          'x-message-ttl': delayMs,
        },
      });

      await channel.sendToQueue(delayedQueue, buffer, {
        persistent: true,
      });
    } else {
      await channel.sendToQueue(queueName, buffer, {
        persistent: true,
      });
    }
  } catch (error) {
    console.error('Failed to push message:', error.message);
  }
};

module.exports = { connectQueue, pushToQueue };