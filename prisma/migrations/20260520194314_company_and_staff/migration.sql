-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "phone" TEXT,
    "kvkNumber" TEXT,
    "vatNumber" TEXT,
    "iban" TEXT,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 30,
    "defaultVatRate" REAL NOT NULL DEFAULT 21,
    "paymentTerms" TEXT
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CrewShiftStaff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    CONSTRAINT "CrewShiftStaff_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CrewShift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrewShiftStaff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CrewShiftStaff_shiftId_staffId_key" ON "CrewShiftStaff"("shiftId", "staffId");
