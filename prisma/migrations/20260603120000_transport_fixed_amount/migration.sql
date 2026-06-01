-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('PER_KM', 'FIXED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "transportType" "TransportType" NOT NULL DEFAULT 'PER_KM';
ALTER TABLE "Project" ADD COLUMN "transportFixedAmount" DOUBLE PRECISION;
