-- DropIndex
DROP INDEX "category_budgets_user_id_category_key";

-- CreateIndex
CREATE UNIQUE INDEX "category_budgets_user_id_type_category_key" ON "category_budgets"("user_id", "type", "category");
