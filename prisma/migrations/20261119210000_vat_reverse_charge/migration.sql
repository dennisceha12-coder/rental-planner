-- AlterTable
ALTER TABLE "Client" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT 'NL';
ALTER TABLE "Client" ADD COLUMN "vatReverseChargeDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "vatReverseCharge" BOOLEAN NOT NULL DEFAULT false;
