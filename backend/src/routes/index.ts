import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Future routes will be added here:
// router.use('/api/v1/auth', authRoutes);
// router.use('/api/v1/users', userRoutes);
// router.use('/api/v1/ai', aiRoutes);
// router.use('/api/v1/transactions', transactionRoutes);
// router.use('/api/v1/budget', budgetRoutes);
// router.use('/api/v1/stats', statsRoutes);

export default router;
