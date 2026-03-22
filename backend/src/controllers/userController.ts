import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { updateProfileSchema } from '../validators/userValidators';
import * as userService from '../services/userService';
import { createI18nError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { t } from '../i18n';
import { ZodError } from 'zod';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await userService.getProfile(userId);

    const response: ApiResponse<typeof user> = {
      code: 200,
      message: 'success',
      data: user,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createI18nError('validation_failed', 400, formatZodErrors(parsed.error));
    }

    const user = await userService.updateProfile(userId, parsed.data);

    const response: ApiResponse<typeof user> = {
      code: 200,
      message: t('update_success', req.locale),
      data: user,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
