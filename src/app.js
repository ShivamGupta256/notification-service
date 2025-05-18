const express = require('express');
const app =express();
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
connectDB();
const notificationRoutes = require('./routes/notificationRoutes');
const { connectQueue } = require('./queues/notificationQueue');

app.use(express.json());

app.use(notificationRoutes);


app.get('/', (req,res) => {
    res.send('Notification service API is running');
});

connectQueue();

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> {
    console.log(`server live on port ${PORT}`);
});