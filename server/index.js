require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Sanitize data against NoSQL query injection (Express 5 compatible wrapper)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    // In Express 5, req.query is readonly, so we mutate it in-place
    const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
    for (const key in req.query) delete req.query[key];
    for (const key in sanitizedQuery) req.query[key] = sanitizedQuery[key];
  }
  next();
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/disbursements', require('./routes/disbursementRoutes'));
app.use('/api/page-configs', require('./routes/pageConfigRoutes'));
app.use('/api/visions', require('./routes/visionRoutes'));
app.use('/api/archives', require('./routes/archiveRoutes'));

app.get('/', (req, res) => {
  res.send('ReConnect & Rise API is running...');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
