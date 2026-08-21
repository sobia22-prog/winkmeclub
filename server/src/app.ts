import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Configure CORS for production (Vercel & custom domains)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  'https://winkmeclub.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

// Global Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed list, vercel preview subdomains, or wildcard
      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((o) => o === '*') ||
        /\.vercel\.app$/.test(origin) ||
        origin.includes('vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }

      // Default fallback: allow origin to prevent CORS blocking on live deployments
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wink Me Club API Server is running smoothly.' });
});

// Register API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
