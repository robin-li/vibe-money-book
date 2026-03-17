import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  createTransaction,
  listTransactions,
  getTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = Router();

router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, listTransactions);
router.get('/:id', authMiddleware, getTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

export default router;
