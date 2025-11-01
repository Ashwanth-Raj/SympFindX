const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const colors = require('colors');
const mongoose = require('mongoose');
const axios = require('axios');

dotenv.config();

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const specialistRoutes = require('./routes/specialist');
const reportRoutes = require('./routes/reports');
const predictionRoutes = require('./routes/prediction');

const app = express();

// 1) CORS FIRST (use CLIENT_URL from .env)
const allowedOrigin = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
origin: allowedOrigin,
credentials: true,
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Make sure preflight OPTIONS always gets CORS headers
app.options('*', cors(corsOptions));

// 2) Security and parsers
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3) Logging
if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
} else {
app.use(morgan('combined'));
}

// 4) DB
connectDB().catch(err => {
console.error('❌ Failed to connect to MongoDB:'.red.bold, err.message);
process.exit(1);
});

// 5) Rate limiting (AFTER CORS)
const limiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 100,
message: 'Too many requests from this IP, please try again later.',
standardHeaders: true,
legacyHeaders: false,
});
app.use('/api/', limiter);

const predictionLimiter = rateLimit({
windowMs: 60 * 60 * 1000,
max: 20,
message: 'Too many prediction requests, please wait before trying again.',
});
app.use('/api/prediction', predictionLimiter);

// 6) Health checks (also ping Python microservice)
app.get('/health', async (req, res) => {
try {
const predictUrl = process.env.PREDICT_SERVICE_URL || 'http://127.0.0.1:7000/api/predict';
const base = new URL(predictUrl);
const healthUrl = `${base.origin}`/api/health;

let aiServiceStatus = 'unhealthy';
try {
  await axios.get(healthUrl, { timeout: 2000 });
  aiServiceStatus = 'healthy';
} catch (error) {
  console.warn(`⚠️ AI service health check failed: ${error.message}`.yellow);
  aiServiceStatus = 'unhealthy';
}

res.status(200).json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  ai_service: aiServiceStatus,
  allowed_origin: allowedOrigin
});
} catch (error) {
res.status(503).json({
status: 'unhealthy',
error: error.message,
timestamp: new Date().toISOString(),
});
}
});

// 7) Routes
app.use('/api/auth', authRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/specialist', specialistRoutes);
app.use('/api/reports', reportRoutes);

// Root
app.get('/', (req, res) => {
res.json({
message: 'SympFindX API Server',
version: '1.0.0',
health: '/health',
});
});

// 8) Errors
app.use(notFound);
app.use(errorHandler);

// 9) Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
console.log('🚀 Initializing SympFindX Server...'.yellow.bold);
console.log(`🌟 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}.green.bold`);
console.log(`🏥 SympFindX API ready at http://localhost:${PORT}.blue.bold`);
console.log(`✅ CORS allowed origin: ${allowedOrigin}.blue`);
console.log(`📋 Health check: http://localhost:${PORT}/health.blue`);
});

// Graceful shutdown
const shutdown = () => {
console.log('👋 Shutting down gracefully...'.yellow);
server.close(() => {
console.log('✅ Server shut down successfully'.green);
mongoose.connection.close(false).then(() => {
console.log('✅ MongoDB connection closed'.green);
process.exit(0);
});
});
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (err) => {
console.log(`❌ Unhandled Promise Rejection: ${err.message}.red.bold`);
});