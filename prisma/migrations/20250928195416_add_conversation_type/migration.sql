/*
  Warnings:

  - Added the required column `type` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "urgency" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "current_status" TEXT NOT NULL,
    "current_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_conversations" ("created_at", "current_reason", "current_status", "id", "is_active", "job_type", "phone", "updated_at", "urgency") SELECT "created_at", "current_reason", "current_status", "id", "is_active", "job_type", "phone", "updated_at", "urgency" FROM "conversations";
DROP TABLE "conversations";
ALTER TABLE "new_conversations" RENAME TO "conversations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
