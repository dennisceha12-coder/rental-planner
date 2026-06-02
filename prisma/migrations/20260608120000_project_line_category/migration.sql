-- AlterTable
ALTER TABLE "ProjectLine" ADD COLUMN "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "ProjectLine" ADD CONSTRAINT "ProjectLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
