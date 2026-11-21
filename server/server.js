require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any Vercel deployment preview or production domain (*.vercel.app)
      if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
        return callback(null, true);
      }

      // Allow local development ports
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // Allow custom client domain if specified in environment
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }

      // Allow all valid incoming web origins
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check Endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lead Manager API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root API Endpoint
app.get(['/api', '/'], (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Lead Manager API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Ensure database is connected (essential for Vercel serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Mount Routes (supporting both /api/* and direct routes for Vercel serverless functions)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/leads', '/leads'], leadRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server if running as standalone process (local or Render/Railway)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] Lead Manager API running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(`[Server Start Failed] ${err.message}`);
      app.listen(PORT, () => {
        console.log(`[Server] Lead Manager API running on port ${PORT} (Database connection pending)`);
      });
    });
}

module.exports = app;
