import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { requestLogger } from './middlewares/requestLogger';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// Global middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(apiRateLimiter);

// Routes
app.use(routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
