import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { isDbReady } from './config/db';

const app = express();

// Enable Gzip/Brotli HTTP Response Compression
app.use(compression());

// 1. Bulletproof Custom CORS Middleware (Runs FIRST before any other middleware or routes)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // Dynamically reflect any requested headers in preflight to prevent CORS header rejections
  const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, *');
  }

  // Respond immediately to browser preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// 2. Standard CORS package fallback
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', '*'],
  })
);

// 3. Helmet security headers with crossOriginResourcePolicy disabled to prevent CORS drops
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', (req, res, next) => {
  if (!isDbReady()) {
    return res.status(503).json({ message: 'Database temporarily unavailable. Please retry.' });
  }
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wink Me Club API Server is running smoothly.' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wink Me Club API Server is running smoothly.' });
});

import path from 'path';

// Register API Routes
app.use('/api', routes);

// Serve static frontend files from 'public' directory
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA catch-all route for React client-side router
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

export default app;
