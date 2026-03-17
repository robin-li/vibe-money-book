import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock Prisma
vi.mock('../config/database', () => {
  const users: Record<string, {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    persona: string;
    aiEngine: string;
    monthlyBudget: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {};

  return {
    default: {
      user: {
        findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email) {
            return Object.values(users).find((u) => u.email === where.email) || null;
          }
          if (where.id) {
            return users[where.id] || null;
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const user = {
            id,
            name: data.name as string,
            email: data.email as string,
            passwordHash: data.passwordHash as string,
            persona: 'gentle',
            aiEngine: 'gemini',
            monthlyBudget: 30000,
            currency: 'TWD',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          users[id] = user;
          return user;
        }),
      },
      // Store reference so tests can clear it
      _users: users,
    },
  };
});

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async (password: string) => `hashed_${password}`),
    compare: vi.fn(async (password: string, hash: string) => hash === `hashed_${password}`),
  },
}));

beforeEach(() => {
  // Clear user store before each test (access via dynamic import)
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('註冊成功');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.name).toBe('Test User');
    expect(res.body.data.user.persona).toBe('gentle');
    expect(res.body.data.user.ai_engine).toBe('gemini');
    expect(res.body.data.user.monthly_budget).toBe(30000);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;

    // First registration
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User 1', email, password: 'password123' });

    // Second registration with same email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User 2', email, password: 'password456' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(409);
    expect(res.body.message).toBe('此 Email 已被註冊');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 for short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  const testEmail = `login-test-${Date.now()}@example.com`;

  beforeEach(async () => {
    // Register a user first
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Login User', email: testEmail, password: 'password123' });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('登入成功');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(401);
    expect(res.body.message).toBe('Email 或密碼錯誤');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(401);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-email', password: 'password123' });

    expect(res.status).toBe(400);
  });
});
