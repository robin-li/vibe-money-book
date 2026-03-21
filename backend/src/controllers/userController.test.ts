import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { jwtConfig } from '../config/jwt';

const TEST_USER_ID = 'user-profile-test';

function makeTestUser() {
  return {
    id: TEST_USER_ID,
    name: 'Profile User',
    email: 'profile@example.com',
    passwordHash: 'hashed_password',
    persona: 'gentle',
    aiEngine: 'gemini',
    monthlyBudget: 30000,
    currency: 'TWD',
    language: 'zh-TW',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

// Mock Prisma - factory must not reference outer variables
vi.mock('../config/database', () => {
  let currentUser: Record<string, unknown> | null = null;

  return {
    default: {
      user: {
        findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
          if (!currentUser) return null;
          if (where.id && where.id === currentUser.id) return { ...currentUser };
          if (where.email && where.email === currentUser.email) return { ...currentUser };
          return null;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          if (currentUser && where.id === currentUser.id) {
            currentUser = { ...currentUser, ...data, updatedAt: new Date() };
            return { ...currentUser };
          }
          throw new Error('User not found');
        }),
        create: vi.fn(),
      },
      _setUser: (user: Record<string, unknown> | null) => {
        currentUser = user ? { ...user } : null;
      },
    },
  };
});

function getToken(userId: string = TEST_USER_ID): string {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: '1h' });
}

beforeEach(async () => {
  const prisma = (await import('../config/database')).default;
  (prisma as unknown as { _setUser: (u: Record<string, unknown>) => void })._setUser(makeTestUser());
});

describe('GET /api/v1/users/profile', () => {
  it('should return user profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data.id).toBe(TEST_USER_ID);
    expect(res.body.data.name).toBe('Profile User');
    expect(res.body.data.email).toBe('profile@example.com');
    expect(res.body.data.persona).toBe('gentle');
    expect(res.body.data.ai_engine).toBe('gemini');
    expect(res.body.data.monthly_budget).toBe(30000);
    expect(res.body.data.currency).toBe('TWD');
    expect(res.body.data.created_at).toBeDefined();
    // Should not expose password
    expect(res.body.data.password_hash).toBeUndefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/profile');

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent user', async () => {
    const token = jwt.sign({ userId: 'non-existent' }, jwtConfig.secret, {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/users/profile', () => {
  it('should update name', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data.name).toBe('New Name');
  });

  it('should update persona', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ persona: 'sarcastic' });

    expect(res.status).toBe(200);
    expect(res.body.data.persona).toBe('sarcastic');
  });

  it('should update ai_engine', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ ai_engine: 'openai' });

    expect(res.status).toBe(200);
    expect(res.body.data.ai_engine).toBe('openai');
  });

  it('should update monthly_budget', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ monthly_budget: 50000 });

    expect(res.status).toBe(200);
    expect(res.body.data.monthly_budget).toBe(50000);
  });

  it('should return 400 for invalid persona', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ persona: 'invalid_persona' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid ai_engine', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ ai_engine: 'invalid_engine' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty body', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for negative monthly_budget', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ monthly_budget: -1000 });

    expect(res.status).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .send({ name: 'New Name' });

    expect(res.status).toBe(401);
  });
});
