import cors from "cors";
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ── CORS (FIXED) ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fitsense-frontend.onrender.com"
  ],
  credentials: true
}));

// Handle preflight requests (IMPORTANT)
app.options("*", cors());

// Force headers (extra safety layer)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── HTTP request logger (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    message:   '🏋️  FitSense API is running',
    env:       process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/workouts',   require('./routes/workoutRoutes'));
app.use('/api/analytics',  require('./routes/analyticsRoutes'));
app.use('/api/suggestion', require('./routes/suggestionRoutes'));

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
