import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { category: 'food', budgetLimit: 8000 },
  { category: 'transport', budgetLimit: 3000 },
  { category: 'entertainment', budgetLimit: 3000 },
  { category: 'shopping', budgetLimit: 3000 },
  { category: 'daily', budgetLimit: 2000 },
  { category: 'medical', budgetLimit: 2000 },
  { category: 'education', budgetLimit: 2000 },
  { category: 'other', budgetLimit: 0 },
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
