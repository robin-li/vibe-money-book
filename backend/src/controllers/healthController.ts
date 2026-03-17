import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export function healthCheck(_req: Request, res: Response): void {
  const response: ApiResponse<{ status: string; uptime: number }> = {
    code: 200,
    message: 'success',
    data: {
      status: 'ok',
      uptime: process.uptime(),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
}
