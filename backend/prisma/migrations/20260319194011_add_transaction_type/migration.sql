-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "raw_text" TEXT NOT NULL,
    "note" TEXT,
    "transaction_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("amount", "category", "created_at", "id", "merchant", "note", "raw_text", "transaction_date", "updated_at", "user_id") SELECT "amount", "category", "created_at", "id", "merchant", "note", "raw_text", "transaction_date", "updated_at", "user_id" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date" DESC);
CREATE INDEX "transactions_user_id_category_idx" ON "transactions"("user_id", "category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
