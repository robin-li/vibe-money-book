import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /stats/distribution - 消費分佈比例
router.get('/distribution', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Support optional month query param (format: YYYY-MM)
    const monthParam = req.query.month as string | undefined;
    let year: number, month: number;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const parts = monthParam.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: monthStart, lte: monthEnd },
      },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Aggregate by category
    const categoryMap: Record<string, number> = {};
    for (const t of transactions) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    }

    const distribution = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        ratio: total > 0 ? Math.round((amount / total) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    const response: ApiResponse<Record<string, unknown>> = {
      code: 200,
      message: '取得成功',
      data: {
        month: monthStr,
        total,
        distribution,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
