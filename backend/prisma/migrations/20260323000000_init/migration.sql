-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "persona" TEXT NOT NULL DEFAULT 'gentle',
    "ai_engine" TEXT NOT NULL DEFAULT 'gemini',
    "monthly_budget" DECIMAL(65,30) NOT NULL DEFAULT 30000.00,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "language" TEXT NOT NULL DEFAULT 'zh-TW',
    "ai_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "budget_limit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "amount" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "raw_text" TEXT NOT NULL,
    "note" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedbacks" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "emotion_tag" TEXT,
    "persona_used" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "category_budgets_user_id_idx" ON "category_budgets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_budgets_user_id_type_category_key" ON "category_budgets"("user_id", "type", "category");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date" DESC);

-- CreateIndex
CREATE INDEX "transactions_user_id_category_idx" ON "transactions"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ai_feedbacks_transaction_id_key" ON "ai_feedbacks"("transaction_id");

-- CreateIndex
CREATE INDEX "ai_feedbacks_transaction_id_idx" ON "ai_feedbacks"("transaction_id");

-- CreateIndex
CREATE INDEX "ai_feedbacks_user_id_idx" ON "ai_feedbacks"("user_id");

-- AddForeignKey
ALTER TABLE "category_budgets" ADD CONSTRAINT "category_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedbacks" ADD CONSTRAINT "ai_feedbacks_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedbacks" ADD CONSTRAINT "ai_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
