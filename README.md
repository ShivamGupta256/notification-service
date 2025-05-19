# 🚀 Notification Service API

A robust backend notification system built with **Node.js**, **Express**, **MongoDB**, **RabbitMQ**, and **Nodemailer/Twilio**, designed to queue and deliver **Email**, **SMS**, and **In-App** notifications efficiently.

> ✅ API hosted at: [https://notification-service-by-shivam.onrender.com](https://notification-service-by-shivam.onrender.com)

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Retry Logic](#retry-logic)
- [Notes & Limitations](#notes--limitations)
- [For Recruiters](#for-recruiters)
- [Credits](#credits)

---

## ✨ Features

- ✅ Accepts notification requests via REST API (email, SMS, in-app)
- ✅ Queues jobs via **RabbitMQ** for decoupled processing
- ✅ Stores all notifications in **MongoDB** with status tracking (`pending`, `sent`, `failed`, `skipped`)
- ✅ Worker processes jobs asynchronously
- ✅ **Email** delivery via Gmail SMTP (Nodemailer)
- ✅ **SMS** via Twilio (with send limit for non-verified numbers to prevent costs)
- ✅ **In-App** notifications visible via API
- ✅ **Retry mechanism** for failed jobs (max 3 retries with delay)
- ✅ Health check endpoint (`/healthz`) for deployment monitoring
- ✅ Clean code structure with separation of concerns
- ✅ Ready for interviews, demos, and real use cases

---

## ⚙️ Tech Stack

| Layer              | Technology               |
|--------------------|--------------------------|
| Language           | Node.js                  |
| Framework          | Express.js               |
| Database           | MongoDB (via Atlas)      |
| Queue              | RabbitMQ (via CloudAMQP) |
| Email Service      | Nodemailer + Gmail SMTP  |
| SMS Service        | Twilio (trial)           |
| Deployment (API)   | Render.com (free tier)   |
| Background Worker  | Manually run locally     |

---

## 🧱 Architecture

```
CLIENT → API (Express)
      → MongoDB (store notifications)
      → RabbitMQ (queue notification jobs)
                     ↓
                 Worker (runs separately)
      → Email/SMS/In-App services
```
---

# ⚙️ Setup & Installation

## ✅ Prerequisites

* **Node.js (v18+ recommended, v21.7.2 used)**
* **MongoDB Atlas account (free)**
* **CloudAMQP account (Little Lemur free plan)**
* **Twilio account (trial is free)**
* **Gmail account with App Password (for email sending)**
* **Postman (for testing the API)**

## 📦 Installation

### 1. Clone the Repo

```bash
git clone https://github.com/ShivamGupta256/notification-service.git
cd notification-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a .env File

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=your_mongo_db_atlas_url
RABBITMQ_URL=your_cloudamqp_url
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
TWILIO_VERIFIED_TO=your_verified_number_for_trial
```

### 4. Start the Express API (Development)

```bash
npm run dev
```

### 5. Start the Notification Worker (must run locally)

In a second terminal:

```bash
node src/workers/notificationWorker.js
```

## 🔐 Environment Variables Explained

| Variable             | Description                               |
| -------------------- | ----------------------------------------- |
| PORT                 | Port to run Express server (default 5000) |
| MONGO\_URI           | Your MongoDB Atlas connection string      |
| RABBITMQ\_URL        | Your CloudAMQP RabbitMQ URL               |
| EMAIL\_USER          | Gmail address used to send emails         |
| EMAIL\_PASS          | App password for that Gmail address       |
| TWILIO\_SID          | Twilio project SID                        |
| TWILIO\_AUTH\_TOKEN  | Twilio auth token                         |
| TWILIO\_PHONE        | Your Twilio trial phone number            |
| TWILIO\_VERIFIED\_TO | Your verified recipient number for SMS    |

## 🧠 How the System Works

1. You (or a frontend) send a POST request to `/notifications` with one or more messages.
2. The server:

   * Saves each notification to MongoDB with a pending status.
   * Pushes a message to RabbitMQ.
3. The worker:

   * Listens to the RabbitMQ queue.
   * Processes each job:

     * Sends email/SMS/in-app notification.
     * Updates the status in MongoDB to sent, failed, or skipped.
     * Retries up to 3 times on failure (e.g., network errors).
4. A GET endpoint lets you view all notifications for a user — with optional filters like `type=email`.

## 📡 API Endpoints

### 1. `POST /notifications`

Queue one or more notifications to be sent via email, SMS, or in-app.

- **URL:** `https://notification-service-by-shivam.onrender.com/notifications`
- **Method:** `POST`
- **Content-Type:** `application/json`

#### ✅ Sample Request Body:

```json
{
  "userId": "user123",
  "notifications": [
    {
      "type": "email",
      "to": "test@example.com",
      "subject": "Welcome!",
      "message": "Thanks for signing up!"
    },
    {
      "type": "sms",
      "to": "+919000000000",
      "message": "Your account has been created."
    },
    {
      "type": "in-app",
      "message": "Welcome to our platform!"
    }
  ]
}
```

#### ✅ Sample Successful Response:

```json
{
  "message": "Notifications queued",
  "savedNotifications": [
    {
      "_id": "someId",
      "userId": "user123",
      "type": "email",
      "status": "pending",
      ...
    },
    ...
  ]
}
```

---

### 2. `GET /users/:userId/notifications`

Get all notifications for a user. You can **filter** by `type` for easier access to either ['email', 'sms', 'in-app'].

- **URL:** `https://notification-service-by-shivam.onrender.com/users/user123/notifications?type=email&status=sent`
- **Method:** `GET`

#### ✅ Query Parameters (optional):

| Parameter | Description                             |
|-----------|-----------------------------------------|
| `type`    | Filter by type: `email`, `sms`, `in-app`|

#### ✅ Sample Response:

```json
[
  {
    "_id": "someId",
    "userId": "user123",
    "type": "email",
    "to": "test@example.com",
    "subject": "Welcome!",
    "message": "Thanks for signing up!",
    "status": "sent",
    "createdAt": "2025-05-17T17:04:54.947Z"
  },
  ...
]
```

---

### 3. `GET /healthz`

Health check endpoint for Render or uptime monitoring.

- **URL:** `https://notification-service-by-shivam.onrender.com/healthz`
- **Response:** `200 OK` with text `OK`

---

## 🧪 Testing with Postman

### 1. Download Postman collection

A pre-built Postman collection is included in the repo as:

```
NotificationService.postman_collection.json
```

### 2. Import into Postman

- Open Postman
- Click `Import` → `File` → Choose the JSON file
- You’ll get pre-configured examples for:
  - POST `/notifications`
  - GET `/users/:id/notifications`
  - GET `/healthz`

### 3. Try with your data

Edit the sample JSON body and submit requests to:

```
https://notification-service-by-shivam.onrender.com
```

Make sure your **worker is running locally** to see full processing.
- Emails will send via Gmail SMTP (requires valid credentials)
- SMS works only to verified numbers (Twilio trial)
- In-App messages appear in the GET `/users/:id/notifications` response

---

## 🔁 Retry Logic

Failed notifications (e.g., due to network issues) are retried automatically.

| Rule                   | Description                     |
|------------------------|---------------------------------|
| Max Retries            | 3                               |
| Delay Between Retries  | 5 seconds                       |
| On Success             | Status updated to `sent`        |
| On Final Failure       | Status updated to `failed`      |
| On SMS Skip (Trial)    | Status updated to `skipped`     |

Retries are handled by the worker and logged in real-time.

#### ✅ Sample Console Logs:

```
❌ Failed to send SMS: unverified number
🔁 Retrying (1/3)...
🔁 Retrying (2/3)...
🚫 SMS limit reached. Skipping send to +919XXXX...
🟡 Notification status: skipped
```
---

## 📝 Notes & Limitations

- ⚠️ **SMS messages can only be sent to verified numbers** when using a Twilio **trial account**.
- ✅ Verified numbers are configured in the `.env` file under `TWILIO_VERIFIED_TO`.
- 🔐 To prevent abuse or accidental billing, the system is restricted to **1 test SMS to any unverified number**, after which further attempts are blocked and logged.
- 🟠 Emails may go to spam unless proper DNS and authentication (SPF, DKIM) are set up on your domain.
- 💻 The **worker** must run **locally** to process jobs from RabbitMQ until it’s deployed to a background-capable host (like Fly.io or Railway).
- 📦 No frontend UI is included — but the API is fully compatible with any Postman testing.

---

## 🧑‍💻 Running the Worker (Locally)

The notification worker is a background process that consumes messages from the RabbitMQ queue and processes notifications.

### ✅ To start the worker:

```bash
node src/workers/notificationWorker.js
```

This should display:

```
Worker connected to MongoDB
Worker connected to RabbitMQ
Connected to RabbitMQ & queue ready
Processing notification ID: ...
```

✅ Keep this running in a separate terminal alongside your Express API.

---

## For Recruiters
* You can currently POST any type of messages on the live URL and it will give you a response but I was unable to deploy the Worker live as Render does not allow *Background Worker* deployment on its free tier account.
* I will try my best to keep the worker running locally but, just in-case there is a failure on my side you can still test the in-App type messages and more but when you GET requset to check a users notifiactions their status would be pending.
* You can successfully GET for userid: user123 to check the samples that I have tested in the database.
* You can also receive emails from my email(as the live server is connected with my credentials) and SMS from the Twilio Number but it only sends messages to verified numbers so it will fail after retrying 3 times for a ranmdom number.
* Thank you for considering.

---

## 🙌 Credits

This project was created by **Shivam** as part of an intern assignment.

- 💻 Tech Stack: Node.js, Express, MongoDB, RabbitMQ
- 📤 Email: Nodemailer + Gmail SMTP
- 📲 SMS: Twilio Trial
- 🐇 Queue: CloudAMQP (Little Lemur)
- ☁️ Hosting: Render (API only)

🔗 API Live: [https://notification-service-by-shivam.onrender.com](https://notification-service-by-shivam.onrender.com)

---
