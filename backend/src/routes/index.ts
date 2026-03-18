import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import aiRoutes from './aiRoutes';
import transactionRoutes from './transactionRoutes';
import budgetRoutes from './budgetRoutes';
import statsRoutes from './statsRoutes';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API v1 routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/ai', aiRoutes);
router.use('/api/v1/transactions', transactionRoutes);
router.use('/api/v1/budget', budgetRoutes);
router.use('/api/v1/stats', statsRoutes);

export default router;
