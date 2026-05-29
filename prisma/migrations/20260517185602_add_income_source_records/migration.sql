-- CreateTable
CREATE TABLE "IncomeSourceEntryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "profit" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IncomeSourceEntryRecord_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "IncomeSourceEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IncomeSourceEntryRecord_entryId_year_month_key" ON "IncomeSourceEntryRecord"("entryId", "year", "month");
