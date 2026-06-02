-- AlterTable
ALTER TABLE "ProjectLine" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectLine_categoryId_fkey'
  ) THEN
    ALTER TABLE "ProjectLine"
      ADD CONSTRAINT "ProjectLine_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
