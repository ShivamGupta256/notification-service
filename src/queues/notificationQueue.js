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

const pushToQueue = async (queueName, message) => {
    try {
        if(!channel)
            throw new Error("No channel connected yet");
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
    }
    catch(error) {
        console.error("Failed to push message: ",error.message);
    }
};

module.exports = { connectQueue, pushToQueue };