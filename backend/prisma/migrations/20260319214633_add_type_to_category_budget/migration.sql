-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_category_budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "budget_limit" DECIMAL NOT NULL DEFAULT 0,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "category_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_category_budgets" ("budget_limit", "category", "created_at", "id", "is_custom", "updated_at", "user_id") SELECT "budget_limit", "category", "created_at", "id", "is_custom", "updated_at", "user_id" FROM "category_budgets";
DROP TABLE "category_budgets";
ALTER TABLE "new_category_budgets" RENAME TO "category_budgets";
CREATE INDEX "category_budgets_user_id_idx" ON "category_budgets"("user_id");
CREATE UNIQUE INDEX "category_budgets_user_id_category_key" ON "category_budgets"("user_id", "category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
