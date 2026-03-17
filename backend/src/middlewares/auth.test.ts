import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from './auth';
import { errorHandler } from './errorHandler';
import { jwtConfig } from '../config/jwt';

// Create a small test app for middleware testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/test', authMiddleware, (req: AuthRequest, res) => {
    res.json({ userId: req.userId });
  });

  app.use(errorHandler);
  return app;
}

describe('Auth Middleware', () => {
  const testApp = createTestApp();

  it('should pass with a valid token and inject userId', async () => {
    const token = jwt.sign({ userId: 'test-user-id' }, jwtConfig.secret, {
      expiresIn: '1h',
    });

    const res = await request(testApp)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('test-user-id');
  });

  it('should return 401 when no Authorization header', async () => {
    const res = await request(testApp).get('/test');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未提供認證 Token');
  });

  it('should return 401 when Authorization header does not start with Bearer', async () => {
    const res = await request(testApp)
      .get('/test')
      .set('Authorization', 'Basic some-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未提供認證 Token');
  });

  it('should return 401 for an invalid token', async () => {
    const res = await request(testApp)
      .get('/test')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token 無效');
  });

  it('should return 401 for an expired token', async () => {
    const token = jwt.sign({ userId: 'test-user-id' }, jwtConfig.secret, {
      expiresIn: '0s',
    });

    // Wait a tiny bit to ensure expiration
    await new Promise((resolve) => setTimeout(resolve, 10));

    const res = await request(testApp)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token 已過期');
  });

  it('should return 401 for a token signed with wrong secret', async () => {
    const token = jwt.sign({ userId: 'test-user-id' }, 'wrong-secret', {
      expiresIn: '1h',
    });

    const res = await request(testApp)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token 無效');
  });
});
