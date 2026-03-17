import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';
const skipInTest = () => isTest;

// General API rate limiter: 100 req/min
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API_PER_MIN || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    code: 429,
    message: '請求過於頻繁，請稍後再試',
    timestamp: new Date().toISOString(),
  },
});

// LLM-related rate limiter: 20 req/min/user
export const llmRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LLM_PER_MIN || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    code: 429,
    message: 'LLM 請求過於頻繁，請稍後再試',
    timestamp: new Date().toISOString(),
  },
});

// Auth rate limiter: 10 req/min/IP
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    code: 429,
    message: '認證請求過於頻繁，請稍後再試',
    timestamp: new Date().toISOString(),
  },
});
