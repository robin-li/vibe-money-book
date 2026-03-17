import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/authValidators';
import * as authService from '../services/authService';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { ZodError } from 'zod';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const result = await authService.register(parsed.data);

    const response: ApiResponse<typeof result> = {
      code: 201,
      message: '註冊成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const result = await authService.login(parsed.data);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '登入成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
