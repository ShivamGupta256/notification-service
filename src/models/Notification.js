const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        reuired: true
    },
    type: {
        type:String,
        enum: ["email","sms", "in-app"],
            required: true
    },
    to: {
        type: String
    },
    subject: {
        type: String
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);