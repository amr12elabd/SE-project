require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket');

const app = express();
const server = http.createServer(app);
initSocket(server);

connectDB();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/venues', require('./src/routes/venues'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/tasks', require('./src/routes/tasks'));
app.use('/api/budget', require('./src/routes/budget'));
app.use('/api/layout', require('./src/routes/layout'));
app.use('/api/vendors', require('./src/routes/vendors'));
app.use('/api/sourcing-requests', require('./src/routes/sourcing'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/guests', require('./src/routes/guests'));
app.use('/api/invitations', require('./src/routes/invitations'));
app.use('/api/communications', require('./src/routes/communications'));
app.use('/api/feedback', require('./src/routes/feedback'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/notifications', require('./src/routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'PopEyez API is running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`PopEyez server running on port ${PORT}`);
  // Run booking reminders on startup and then every hour
  const { sendUpcomingBookingReminders } = require('./src/jobs/bookingReminders');
  sendUpcomingBookingReminders();
  setInterval(sendUpcomingBookingReminders, 60 * 60 * 1000);
});
