/*
  Warnings:

  - You are about to drop the column `setupHours` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `teardownHours` on the `Project` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CrewShift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "role" TEXT,
    "headcount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "hourlyRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrewShift_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONCEPT',
    "quoteNumber" TEXT,
    "clientId" TEXT NOT NULL,
    "location" TEXT,
    "loadIn" DATETIME,
    "showDate" DATETIME,
    "loadOut" DATETIME,
    "loadInTime" TEXT,
    "showTime" TEXT,
    "loadOutTime" TEXT,
    "siteContact" TEXT,
    "parkingNotes" TEXT,
    "notes" TEXT,
    "hourlyRate" REAL,
    "transportKm" REAL,
    "transportRatePerKm" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("clientId", "createdAt", "hourlyRate", "id", "loadIn", "loadInTime", "loadOut", "loadOutTime", "location", "notes", "parkingNotes", "quoteNumber", "showDate", "showTime", "siteContact", "status", "title", "transportKm", "transportRatePerKm", "updatedAt") SELECT "clientId", "createdAt", "hourlyRate", "id", "loadIn", "loadInTime", "loadOut", "loadOutTime", "location", "notes", "parkingNotes", "quoteNumber", "showDate", "showTime", "siteContact", "status", "title", "transportKm", "transportRatePerKm", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
