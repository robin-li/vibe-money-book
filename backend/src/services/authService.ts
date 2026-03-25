import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { jwtConfig } from '../config/jwt';
import { createI18nError } from '../middlewares/errorHandler';
import { RegisterInput, LoginInput } from '../validators/authValidators';

const BCRYPT_ROUNDS = 10;

/** Default category budgets for new users */
const DEFAULT_CATEGORY_BUDGETS = [
  // 支出類別
  { category: 'entertainment', type: 'expense', budgetLimit: 3000, isCustom: false },
  { category: 'food', type: 'expense', budgetLimit: 8000, isCustom: false },
  { category: 'daily', type: 'expense', budgetLimit: 2000, isCustom: false },
  { category: 'education', type: 'expense', budgetLimit: 2000, isCustom: false },
  { category: 'medical', type: 'expense', budgetLimit: 2000, isCustom: false },
  { category: 'transport', type: 'expense', budgetLimit: 3000, isCustom: false },
  { category: 'pets', type: 'expense', budgetLimit: 0, isCustom: false },
  { category: 'other', type: 'expense', budgetLimit: 0, isCustom: false },
  { category: 'adjustment_expense', type: 'expense', budgetLimit: 0, isCustom: false },
  // 收入類別
  { category: 'salary', type: 'income', budgetLimit: 0, isCustom: false },
  { category: 'investment', type: 'income', budgetLimit: 0, isCustom: false },
  { category: 'pension', type: 'income', budgetLimit: 0, isCustom: false },
  { category: 'insurance', type: 'income', budgetLimit: 0, isCustom: false },
  { category: 'other_income', type: 'income', budgetLimit: 0, isCustom: false },
  { category: 'adjustment_income', type: 'income', budgetLimit: 0, isCustom: false },
];

function generateToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn,
  };
  return jwt.sign({ userId }, jwtConfig.secret, options);
}

export function formatUserResponse(user: {
  id: string;
  name: string;
  email: string;
  persona: string;
  aiEngine: string;
  aiModel?: string | null;
  monthlyBudget: unknown;
  currency: string;
  language: string;
  aiInstructions?: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    persona: user.persona,
    ai_engine: user.aiEngine,
    ai_model: user.aiModel ?? null,
    monthly_budget: Number(user.monthlyBudget),
    currency: user.currency,
    language: user.language,
    ai_instructions: user.aiInstructions ?? null,
    created_at: user.createdAt.toISOString(),
  };
}

export async function register(input: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw createI18nError('email_already_exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  // Create user and default category budgets in a transaction
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      categoryBudgets: {
        create: DEFAULT_CATEGORY_BUDGETS,
      },
    },
  });

  const token = generateToken(user.id);
  return { user: formatUserResponse(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!user) {
    throw createI18nError('invalid_credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw createI18nError('invalid_credentials', 401);
  }

  const token = generateToken(user.id);
  return { user: formatUserResponse(user), token };
}
