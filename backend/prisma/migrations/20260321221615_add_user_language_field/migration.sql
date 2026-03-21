-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "persona" TEXT NOT NULL DEFAULT 'gentle',
    "ai_engine" TEXT NOT NULL DEFAULT 'gemini',
    "monthly_budget" DECIMAL NOT NULL DEFAULT 30000.00,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "language" TEXT NOT NULL DEFAULT 'zh-TW',
    "ai_instructions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("ai_engine", "ai_instructions", "created_at", "currency", "email", "id", "monthly_budget", "name", "password_hash", "persona", "updated_at") SELECT "ai_engine", "ai_instructions", "created_at", "currency", "email", "id", "monthly_budget", "name", "password_hash", "persona", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
