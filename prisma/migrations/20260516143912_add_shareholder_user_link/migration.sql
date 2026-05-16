-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shareholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "userId" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shareholder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Shareholder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shareholder" ("createdAt", "createdById", "email", "id", "name", "phone", "updatedAt") SELECT "createdAt", "createdById", "email", "id", "name", "phone", "updatedAt" FROM "Shareholder";
DROP TABLE "Shareholder";
ALTER TABLE "new_Shareholder" RENAME TO "Shareholder";
CREATE UNIQUE INDEX "Shareholder_userId_key" ON "Shareholder"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
