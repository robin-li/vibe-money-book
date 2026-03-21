import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import { ApiResponse } from '../types';

const router = Router();

// GET /stats/distribution - 消費分佈比例
router.get('/distribution', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Support period (week | month | custom) and date range params
    const periodParam = req.query.period as string | undefined;
    const startDateParam = req.query.start_date as string | undefined;
    const endDateParam = req.query.end_date as string | undefined;
    const monthParam = req.query.month as string | undefined;

    // Support optional type query param (income | expense)
    const typeParam = req.query.type as string | undefined;
    const validTypes = ['income', 'expense'];
    const typeFilter = typeParam && validTypes.includes(typeParam) ? typeParam : undefined;

    let monthStart: Date;
    let monthEnd: Date;

    if (periodParam === 'custom' && startDateParam && endDateParam) {
      // Custom date range
      monthStart = new Date(startDateParam + 'T00:00:00');
      monthEnd = new Date(endDateParam + 'T23:59:59.999');
    } else if (periodParam === 'week') {
      // Current week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
      monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() + 6, 23, 59, 59, 999);
    } else if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const parts = monthParam.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      monthStart = new Date(year, month, 1);
      monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      // Default: current month
      const now = new Date();
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const whereClause: Record<string, unknown> = {
      userId,
      transactionDate: { gte: monthStart, lte: monthEnd },
    };
    if (typeFilter) {
      whereClause.type = typeFilter;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
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

    const monthStr = periodParam === 'custom'
      ? `${startDateParam} ~ ${endDateParam}`
      : `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

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
