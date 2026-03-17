import type { SignOptions } from 'jsonwebtoken';

export const jwtConfig: {
  secret: string;
  expiresIn: SignOptions['expiresIn'];
} = {
  secret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
  expiresIn: '7d',
};
