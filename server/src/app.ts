import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

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
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

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
  })
);

// 3. Helmet security headers with crossOriginResourcePolicy disabled to prevent CORS drops
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Register API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
