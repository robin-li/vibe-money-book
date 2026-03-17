import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Array<{ field: string; reason: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Array<{ field: string; reason: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  const errors = err instanceof AppError ? err.errors : undefined;

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
