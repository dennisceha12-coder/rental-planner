-- AlterTable
ALTER TABLE "ProjectLine" ALTER COLUMN "equipmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectLine" ADD COLUMN "customName" TEXT;
ALTER TABLE "ProjectLine" ADD COLUMN "customDailyRate" DOUBLE PRECISION;
