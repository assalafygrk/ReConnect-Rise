require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

const app = express();

// ─── CORS: Allow all origins for Vercel deployment ───────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Security & Body Parsing ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(mongoSanitize());

// ─── DB Connection Middleware ─────────────────────────────────────────────────
// Connect to DB on every request (serverless-safe — uses cached connection)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB connection failed:', error.message);
    return res.status(503).json({
      message: 'Database unavailable. Please check your MONGODB_URI environment variable on Vercel.',
      error: error.message,
    });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
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

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'ReConnect & Rise API is running' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// This MUST have 4 parameters for Express to treat it as error middleware
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[ERROR] ${statusCode} - ${err.message}`);
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// ─── Local dev server (not used on Vercel) ───────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
