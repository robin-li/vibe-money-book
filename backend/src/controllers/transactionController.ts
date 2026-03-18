import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createTransactionSchema, listTransactionsSchema } from '../validators/transactionValidators';
import * as transactionService from '../services/transactionService';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { ZodError } from 'zod';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

export async function createTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const result = await transactionService.createTransaction(req.userId!, parsed.data);

    const response: ApiResponse<typeof result> = {
      code: 201,
      message: '交易建立成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = listTransactionsSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const result = await transactionService.listTransactions(req.userId!, parsed.data);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: 'success',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await transactionService.getTransaction(req.userId!, id);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: 'success',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await transactionService.updateTransaction(req.userId!, id, req.body);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '交易更新成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await transactionService.deleteTransaction(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
