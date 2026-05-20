-- AlterTable
ALTER TABLE "Project" ADD COLUMN "hourlyRate" REAL;
ALTER TABLE "Project" ADD COLUMN "setupHours" REAL;
ALTER TABLE "Project" ADD COLUMN "teardownHours" REAL;
ALTER TABLE "Project" ADD COLUMN "transportKm" REAL;
ALTER TABLE "Project" ADD COLUMN "transportRatePerKm" REAL;
