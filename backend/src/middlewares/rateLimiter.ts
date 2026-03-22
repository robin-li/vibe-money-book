import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { t } from '../i18n';

const isTest = process.env.NODE_ENV === 'test';
const skipInTest = () => isTest;

function rateLimitMessage(req: Request) {
  return {
    code: 429,
    message: t('rate_limit_exceeded', req.locale),
    timestamp: new Date().toISOString(),
  };
}

// General API rate limiter: 100 req/min
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API_PER_MIN || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: rateLimitMessage,
});

// LLM-related rate limiter: 20 req/min/user
export const llmRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LLM_PER_MIN || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: rateLimitMessage,
});

// Auth rate limiter: 10 req/min/IP
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_PER_MIN || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: rateLimitMessage,
});
