import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { llmRateLimiter } from '../middlewares/rateLimiter';
import { aiParse, validateKey } from '../controllers/aiController';

const router = Router();

router.post('/parse', authMiddleware, llmRateLimiter, aiParse);
router.post('/validate-key', authMiddleware, llmRateLimiter, validateKey);

export default router;
