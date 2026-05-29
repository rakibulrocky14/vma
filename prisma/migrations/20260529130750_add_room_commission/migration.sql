-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoomMonthlyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "rentAmount" DECIMAL NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "commission" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OCCUPIED',
    CONSTRAINT "RoomMonthlyRecord_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoomMonthlyRecord" ("id", "month", "paidAmount", "rentAmount", "roomId", "status", "year") SELECT "id", "month", "paidAmount", "rentAmount", "roomId", "status", "year" FROM "RoomMonthlyRecord";
DROP TABLE "RoomMonthlyRecord";
ALTER TABLE "new_RoomMonthlyRecord" RENAME TO "RoomMonthlyRecord";
CREATE UNIQUE INDEX "RoomMonthlyRecord_roomId_year_month_key" ON "RoomMonthlyRecord"("roomId", "year", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
