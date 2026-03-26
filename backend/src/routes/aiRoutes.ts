import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { llmRateLimiter } from '../middlewares/rateLimiter';
import { aiParse, validateKey, aiQuery, getAIConfig, getProviders, listModels } from '../controllers/aiController';

const router = Router();

router.get('/config', authMiddleware, getAIConfig);
router.get('/providers', authMiddleware, getProviders);
router.get('/models', authMiddleware, listModels);
router.post('/parse', authMiddleware, llmRateLimiter, aiParse);
router.post('/validate-key', authMiddleware, llmRateLimiter, validateKey);
router.post('/query', authMiddleware, llmRateLimiter, aiQuery);

export default router;
