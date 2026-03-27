// Load env variables FIRST before any other import
const dotenv = require('dotenv');
dotenv.config();

const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// ── Boot sequence ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP server
    app.listen(PORT, () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  FitSense API started`);
      console.log(`  Port     : ${PORT}`);
      console.log(`  Env      : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Health   : http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  } catch (error) {
    console.error('  Failed to start server:', error.message);
    process.exit(1);
  }
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('  Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

startServer();
