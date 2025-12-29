import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import env from './config/env.js';
import { logger } from './utils/logger.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import auditMiddleware from './middleware/auditMiddleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
	origin: env.NODE_ENV === 'production' 
		? ['https://yourdomain.com'] 
		: ['http://localhost:3000'],
	credentials: true
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing (capture raw body for webhook signature verification)
app.use(express.json({ limit: '10mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
// Skip express-mongo-sanitize in test environment because it can fail with read-only req.query objects in some test runners
if (env.NODE_ENV !== 'test') {
  app.use(mongoSanitize());
} else {
  app.use((req, res, next) => next());
}

// Compression
app.use(compression());

// Request logging
app.use(auditMiddleware);

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
import apiRoutes from './routes/index.js';
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling
app.use(errorMiddleware);

export default app;
