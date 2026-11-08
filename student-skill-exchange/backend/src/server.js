import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { rateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { setupSockets } from './sockets/socketHandler.js';
import { setIO } from './sockets/socketEmitter.js';
import { testConnection } from './config/db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (curl, same-origin, mobile, health checks)
  if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

// Setup Socket.IO with production CORS & fallback transports
const io = new SocketIOServer(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Configure Socket.IO Handlers
setIO(io);
setupSockets(io);

// Security and utility middlewares
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting (300 requests per minute per IP)
app.use(rateLimiter({ windowMs: 60 * 1000, maxRequests: 300 }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Skill Exchange Backend API is running smoothly.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Mount Master Modular API Routes
app.use('/api', apiRouter);

// API Root informational catalog
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Student Skill Exchange API (SkillSwap)',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      skills: '/api/skills',
      students: '/api/students',
      requests: '/api/requests',
      sessions: '/api/sessions',
      messages: '/api/messages',
      notifications: '/api/notifications',
      reviews: '/api/reviews',
      credits: '/api/credits',
      admin: '/api/admin',
    },
  });
});

// Serve production static frontend if dist folder exists (Monolithic Deployment Support)
const distPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If no static frontend is present, serve API info at root
  app.get('/', (req, res) => {
    res.redirect('/api');
  });
}

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

// Start Server if directly executed
if (process.env.NODE_ENV !== 'test' && !process.env.TEST_RUNNER) {
  server.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 Skill Exchange Backend Server is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed Frontend Origin(s): ${allowedOrigins.join(', ')}`);
    console.log(`===============================================`);
    await testConnection();
  });
}

export { app, server, io };
