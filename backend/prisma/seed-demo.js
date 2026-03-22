const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const p = new PrismaClient();

async function main() {
  // ============================================
  // Vibe Money Book 演示數據 Seed Script v2
  // Email: test@a.b.com / 密碼: Aaa@123456
  // 語系: 繁體中文
  // 日期範圍: 2025-12-01 ~ 2026-03-22
  // 含自訂類別「戶外運動」
  // 總資產 > 30,000
  // ============================================

  const passwordHash = await bcrypt.hash("Aaa@123456", 10);

  // 1. 建立用戶（upsert）
  const user = await p.user.upsert({
    where: { email: "test@a.b.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "test@a.b.com",
      passwordHash,
      persona: "gentle",
      aiEngine: "gemini",
      monthlyBudget: 30000,
      currency: "TWD",
      language: "zh-TW",
    },
  });
  const userId = user.id;
  console.log("User:", user.email, "ID:", userId);

  // 2. 建立預設類別預算
  const categories = [
    { category: "entertainment", type: "expense", budgetLimit: 3000 },
    { category: "food",          type: "expense", budgetLimit: 8000 },
    { category: "daily",         type: "expense", budgetLimit: 2000 },
    { category: "education",     type: "expense", budgetLimit: 2000 },
    { category: "medical",       type: "expense", budgetLimit: 2000 },
    { category: "transport",     type: "expense", budgetLimit: 3000 },
    { category: "pets",          type: "expense", budgetLimit: 2000 },
    { category: "other",         type: "expense", budgetLimit: 0 },
    { category: "adjustment_expense", type: "expense", budgetLimit: 0 },
    { category: "salary",        type: "income",  budgetLimit: 0 },
    { category: "investment",    type: "income",  budgetLimit: 0 },
    { category: "pension",       type: "income",  budgetLimit: 0 },
    { category: "insurance",     type: "income",  budgetLimit: 0 },
    { category: "other_income",  type: "income",  budgetLimit: 0 },
    { category: "adjustment_income", type: "income", budgetLimit: 0 },
    // 自訂類別
    { category: "戶外運動",      type: "expense", budgetLimit: 3000, isCustom: true },
  ];

  for (const cat of categories) {
    await p.categoryBudget.upsert({
      where: { userId_category: { userId, category: cat.category } },
      update: {},
      create: {
        userId,
        category: cat.category,
        type: cat.type,
        budgetLimit: cat.budgetLimit,
        isCustom: cat.isCustom || false,
      },
    });
  }
  console.log("Categories created:", categories.length);

  // 3. 清除舊交易
  await p.transaction.deleteMany({ where: { userId } });

  // 4. 建立交易數據
  const txs = [];

  // ===== 收入（10 筆，共 220,500）=====
  const incomes = [
    // 薪資 4 筆（12月~3月）
    { amount: 52000, cat: "salary",       merchant: "公司薪資",   note: "月薪入帳",     date: "2025-12-05T09:00:00Z" },
    { amount: 52000, cat: "salary",       merchant: "公司薪資",   note: "月薪入帳",     date: "2026-01-05T09:00:00Z" },
    { amount: 52000, cat: "salary",       merchant: "公司薪資",   note: "月薪入帳",     date: "2026-02-05T09:00:00Z" },
    { amount: 52000, cat: "salary",       merchant: "公司薪資",   note: "月薪入帳",     date: "2026-03-05T09:00:00Z" },
    // 投資 3 筆
    { amount:  3500, cat: "investment",   merchant: "ETF配息",    note: "季度配息",     date: "2025-12-20T10:00:00Z" },
    { amount:  5000, cat: "investment",   merchant: "台積電配息", note: "股利入帳",     date: "2026-03-10T10:00:00Z" },
    { amount:  1500, cat: "investment",   merchant: "基金配息",   note: "月配息",       date: "2026-02-15T10:00:00Z" },
    // 其他收入 3 筆
    { amount:  1000, cat: "other_income", merchant: "朋友還錢",   note: null,           date: "2025-12-15T18:00:00Z" },
    { amount:  2000, cat: "other_income", merchant: "二手拍賣",   note: "賣掉舊相機",   date: "2026-01-20T14:00:00Z" },
    { amount:   500, cat: "other_income", merchant: "退款",       note: "網購退貨退款", date: "2026-03-08T11:00:00Z" },
  ];

  // ===== 支出 - 12月（8 筆）=====
  const dec = [
    { amount:   650, cat: "food",          merchant: "鼎泰豐",     note: "和家人聚餐",       date: "2025-12-06T18:30:00Z" },
    { amount:   350, cat: "food",          merchant: "foodpanda",  note: "週末晚餐外賣",     date: "2025-12-13T19:00:00Z" },
    { amount: 25000, cat: "other",         merchant: "房東",       note: "十二月房租",       date: "2025-12-01T09:00:00Z" },
    { amount:   170, cat: "entertainment", merchant: "Netflix",    note: "月費訂閱",         date: "2025-12-01T00:00:00Z" },
    { amount:   750, cat: "transport",     merchant: "台灣高鐵",   note: "回老家",           date: "2025-12-24T07:00:00Z" },
    { amount:  1200, cat: "daily",         merchant: "家樂福",     note: "年末大採購",       date: "2025-12-28T11:00:00Z" },
    { amount:  2000, cat: "戶外運動",      merchant: "陽明山步道", note: "跨年登山健行",     date: "2025-12-31T06:00:00Z" },
    { amount:   800, cat: "pets",          merchant: "寵物店",     note: "皇家貓糧 4kg",     date: "2025-12-10T16:00:00Z" },
  ];

  // ===== 支出 - 1月（10 筆）=====
  const jan = [
    { amount:    85, cat: "food",          merchant: "早餐店",     note: "蛋餅加豆漿",       date: "2026-01-06T07:30:00Z" },
    { amount:   180, cat: "food",          merchant: "便當店",     note: "排骨便當",         date: "2026-01-08T12:00:00Z" },
    { amount:   125, cat: "food",          merchant: "星巴克",     note: "下午茶",           date: "2026-01-18T14:00:00Z" },
    { amount: 25000, cat: "other",         merchant: "房東",       note: "一月房租",         date: "2026-01-01T09:00:00Z" },
    { amount:   170, cat: "entertainment", merchant: "Netflix",    note: "月費訂閱",         date: "2026-01-01T00:00:00Z" },
    { amount:   750, cat: "transport",     merchant: "台灣高鐵",   note: "出差",             date: "2026-01-10T07:00:00Z" },
    { amount:   300, cat: "transport",     merchant: "Uber",       note: "下雨叫車上班",     date: "2026-01-28T08:00:00Z" },
    { amount:   500, cat: "medical",       merchant: "家醫科",     note: "感冒看醫生",       date: "2026-01-22T10:00:00Z" },
    { amount:  1500, cat: "education",     merchant: "Udemy",      note: "買了 React 進階課", date: "2026-01-15T20:00:00Z" },
    { amount:  3000, cat: "戶外運動",      merchant: "墾丁潛水",   note: "週末潛水體驗",     date: "2026-01-26T08:00:00Z" },
  ];

  // ===== 支出 - 2月（9 筆）=====
  const feb = [
    { amount:   200, cat: "food",          merchant: "拉麵店",     note: null,               date: "2026-02-07T12:30:00Z" },
    { amount:  9000, cat: "food",          merchant: "火鍋店",     note: "部門聚餐，8人分攤", date: "2026-02-14T18:00:00Z" },
    { amount:   300, cat: "food",          merchant: "壽司郎",     note: "週末午餐",         date: "2026-02-22T12:00:00Z" },
    { amount: 25000, cat: "other",         merchant: "房東",       note: "二月房租",         date: "2026-02-01T09:00:00Z" },
    { amount:   170, cat: "entertainment", merchant: "Netflix",    note: "月費訂閱",         date: "2026-02-01T00:00:00Z" },
    { amount:   540, cat: "entertainment", merchant: "電影院",     note: "和朋友看新片",     date: "2026-02-08T19:00:00Z" },
    { amount:  1500, cat: "transport",     merchant: "加油站",     note: "油箱加滿",         date: "2026-02-10T17:00:00Z" },
    { amount: 15000, cat: "education",     merchant: "AI Academy", note: "報名 AI 實戰班",   date: "2026-02-20T10:00:00Z" },
    { amount:  1500, cat: "戶外運動",      merchant: "日月潭SUP",  note: "情人節划船",       date: "2026-02-14T09:00:00Z" },
  ];

  // ===== 支出 - 3月（28 筆，含阿貓阿狗 10 筆 + 戶外 2 筆 + 一般 16 筆）=====
  const mar = [
    // 一般消費 16 筆
    { amount:   100, cat: "food",          merchant: "麥當勞",     note: null,               date: "2026-03-02T08:00:00Z" },
    { amount:   250, cat: "food",          merchant: "UberEats",   note: null,               date: "2026-03-07T19:30:00Z" },
    { amount:    65, cat: "food",          merchant: "全家",       note: "買飲料和點心",     date: "2026-03-12T10:00:00Z" },
    { amount:   800, cat: "food",          merchant: "燒肉餐廳",   note: "慶祝生日",         date: "2026-03-15T18:30:00Z" },
    { amount:   500, cat: "food",          merchant: "夜市小吃",   note: "週末逛饒河夜市",   date: "2026-03-20T20:00:00Z" },
    { amount:   170, cat: "entertainment", merchant: "Netflix",    note: "月費訂閱",         date: "2026-03-01T00:00:00Z" },
    { amount:  3500, cat: "entertainment", merchant: "KTV",        note: "部門慶功包廂",     date: "2026-03-18T20:00:00Z" },
    { amount:  3300, cat: "transport",     merchant: "台灣高鐵",   note: "三月通勤月票",     date: "2026-03-01T09:00:00Z" },
    { amount:  1500, cat: "transport",     merchant: "加油站",     note: null,               date: "2026-03-14T17:00:00Z" },
    { amount:   500, cat: "daily",         merchant: "大創",       note: "收納盒和文具",     date: "2026-03-03T15:00:00Z" },
    { amount:  1500, cat: "daily",         merchant: "IKEA",       note: "買了檯燈和抱枕",   date: "2026-03-16T13:00:00Z" },
    { amount:   700, cat: "medical",       merchant: "牙醫診所",   note: "半年定期洗牙",     date: "2026-03-06T14:00:00Z" },
    { amount:  8300, cat: "other",         merchant: "電信費",     note: "手機月租+水電瓦斯", date: "2026-03-05T09:00:00Z" },
    { amount:   350, cat: "daily",         merchant: "屈臣氏",     note: "洗髮精和面膜",     date: "2026-03-09T14:00:00Z" },
    // 戶外運動 2 筆
    { amount:  2000, cat: "戶外運動",      merchant: "攀岩館",     note: "週末室內攀岩",     date: "2026-03-08T10:00:00Z" },
    { amount:   800, cat: "戶外運動",      merchant: "河濱自行車", note: "騎車環河濱",       date: "2026-03-21T07:00:00Z" },
    // 阿貓阿狗寵物店 10 筆
    { amount:   850, cat: "pets", merchant: "阿貓阿狗",  note: "幫毛小孩購買糧食",           date: "2026-03-01T14:00:00Z" },
    { amount:   650, cat: "pets", merchant: "阿貓阿狗",  note: "幫小貓購買貓糧",             date: "2026-03-03T11:00:00Z" },
    { amount:  1200, cat: "pets", merchant: "阿貓阿狗",  note: "買了狗狗的衣服",             date: "2026-03-05T15:00:00Z" },
    { amount:   800, cat: "pets", merchant: "阿貓阿狗",  note: "買了貓咪的帽子",             date: "2026-03-07T16:00:00Z" },
    { amount:   450, cat: "pets", merchant: "阿貓阿狗",  note: "貓咪零食和逗貓棒",           date: "2026-03-10T13:00:00Z" },
    { amount:   380, cat: "pets", merchant: "阿貓阿狗",  note: "買了貓砂和除臭噴霧",         date: "2026-03-13T10:00:00Z" },
    { amount:  1500, cat: "pets", merchant: "阿貓阿狗",  note: "幫狗狗買了新的牽繩和項圈",   date: "2026-03-15T11:00:00Z" },
    { amount:   600, cat: "pets", merchant: "阿貓阿狗",  note: "買了寵物洗毛精和梳子",       date: "2026-03-17T14:00:00Z" },
    { amount:   950, cat: "pets", merchant: "阿貓阿狗",  note: "貓咪罐頭和營養膏補貨",       date: "2026-03-19T10:00:00Z" },
    { amount:   350, cat: "pets", merchant: "阿貓阿狗",  note: "買了小貓的玩具球和跳台配件", date: "2026-03-22T09:00:00Z" },
  ];

  for (const inc of incomes) {
    txs.push({ userId, type: "income",  amount: inc.amount, category: inc.cat, merchant: inc.merchant, note: inc.note, rawText: inc.merchant, transactionDate: new Date(inc.date) });
  }
  for (const exp of [...dec, ...jan, ...feb, ...mar]) {
    txs.push({ userId, type: "expense", amount: exp.amount, category: exp.cat, merchant: exp.merchant, note: exp.note, rawText: exp.merchant, transactionDate: new Date(exp.date) });
  }

  const result = await p.transaction.createMany({ data: txs });
  console.log("Created " + result.count + " transactions");

  // 驗算
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = [...dec, ...jan, ...feb, ...mar].reduce((s, e) => s + e.amount, 0);
  console.log("Income:", totalIncome, "Expense:", totalExpense, "Net:", totalIncome - totalExpense);
  console.log("Total txs:", incomes.length + dec.length + jan.length + feb.length + mar.length);

  // 驗證 3 月查詢
  const now = new Date();
  const marchStart = new Date(2026, 2, 1);
  const marchEnd = new Date(2026, 2, 31, 23, 59, 59, 999);
  const marchCount = await p.transaction.count({ where: { userId, transactionDate: { gte: marchStart, lte: marchEnd } } });
  console.log("March transactions:", marchCount);

  await p.$disconnect();
}

main().catch(console.error);
