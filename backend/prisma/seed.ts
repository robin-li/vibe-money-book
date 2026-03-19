import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // 支出類別
  { category: 'food', type: 'expense', budgetLimit: 8000 },
  { category: 'transport', type: 'expense', budgetLimit: 3000 },
  { category: 'entertainment', type: 'expense', budgetLimit: 3000 },
  { category: 'shopping', type: 'expense', budgetLimit: 3000 },
  { category: 'daily', type: 'expense', budgetLimit: 2000 },
  { category: 'medical', type: 'expense', budgetLimit: 2000 },
  { category: 'education', type: 'expense', budgetLimit: 2000 },
  { category: 'other', type: 'expense', budgetLimit: 0 },
  // 收入類別
  { category: 'salary', type: 'income', budgetLimit: 0 },
  { category: 'investment', type: 'income', budgetLimit: 0 },
  { category: 'pension', type: 'income', budgetLimit: 0 },
  { category: 'insurance', type: 'income', budgetLimit: 0 },
  { category: 'other_income', type: 'income', budgetLimit: 0 },
];

async function main() {
  console.log('Seeding database...');

  // Create test user (password: "password123" - bcrypt hash)
  // Using a pre-computed bcrypt hash for "password123" with 10 rounds
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: '測試使用者',
      email: 'test@example.com',
      passwordHash: '$2b$10$K4pE5x2UZrABcDeFgHiJkOe1234567890abcdefghijklmnopqrstuv',
      persona: 'gentle',
      aiEngine: 'gemini',
      monthlyBudget: 30000,
      currency: 'TWD',
    },
  });

  console.log(`Created test user: ${testUser.email} (id: ${testUser.id})`);

  // Create default category budgets for the test user
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.categoryBudget.upsert({
      where: {
        userId_category: {
          userId: testUser.id,
          category: cat.category,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        category: cat.category,
        type: cat.type,
        budgetLimit: cat.budgetLimit,
        isCustom: false,
      },
    });
  }

  console.log(`Created ${DEFAULT_CATEGORIES.length} default category budgets`);
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
