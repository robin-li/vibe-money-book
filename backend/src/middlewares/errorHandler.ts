import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { t } from '../i18n';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Array<{ field: string; reason: string }>;
  /** i18n translation key (e.g. 'errors.user_not_found') */
  public readonly i18nKey?: string;
  /** Interpolation params for the translation key */
  public readonly i18nParams?: Record<string, string | number>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Array<{ field: string; reason: string }>,
    i18nKey?: string,
    i18nParams?: Record<string, string | number>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.i18nKey = i18nKey;
    this.i18nParams = i18nParams;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Create an AppError using an i18n key.
 * The default-language translation is used as the fallback message.
 */
export function createI18nError(
  key: string,
  statusCode: number = 500,
  errors?: Array<{ field: string; reason: string }>,
  params?: Record<string, string | number>
): AppError {
  // Use the default language (zh-TW) translation as the message fallback
  const message = t(key, undefined, params);
  return new AppError(message, statusCode, errors, key, params);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errors = err instanceof AppError ? err.errors : undefined;

  // Determine the message: if AppError has an i18n key, translate using req.locale
  let message: string;
  if (err instanceof AppError && err.i18nKey) {
    message = t(err.i18nKey, req.locale, err.i18nParams);
  } else if (err instanceof AppError) {
    message = err.message;
  } else {
    message = t('internal_error', req.locale);
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${statusCode} - ${err.message}`, err.stack);
  }

  const response: ApiResponse = {
    code: statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
