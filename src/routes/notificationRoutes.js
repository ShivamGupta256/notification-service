const express = require('express');
const { sendNotification, getUserNotifications } = require('../controllers/notificationController');

const router = express.Router();

router.post('/notifications', sendNotification);
router.get('/users/:id/notifications', getUserNotifications);

module.exports = router;