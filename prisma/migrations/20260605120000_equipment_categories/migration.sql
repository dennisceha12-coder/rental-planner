-- CreateTable
CREATE TABLE "EquipmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentCategory_name_key" ON "EquipmentCategory"("name");

-- Seed default categories
INSERT INTO "EquipmentCategory" ("id", "name", "sortOrder", "updatedAt")
VALUES
  ('cat_geluid', 'Geluid', 0, CURRENT_TIMESTAMP),
  ('cat_licht', 'Licht', 1, CURRENT_TIMESTAMP),
  ('cat_rigging', 'Rigging', 2, CURRENT_TIMESTAMP),
  ('cat_overig', 'Overig', 999, CURRENT_TIMESTAMP);

-- Migrate distinct existing category strings (case-sensitive match to defaults first)
INSERT INTO "EquipmentCategory" ("id", "name", "sortOrder", "updatedAt")
SELECT
  'cat_' || lower(replace(trim("category"), ' ', '_')),
  trim("category"),
  100,
  CURRENT_TIMESTAMP
FROM "Equipment"
WHERE "category" IS NOT NULL
  AND trim("category") <> ''
  AND trim("category") NOT IN ('Geluid', 'Licht', 'Rigging', 'Overig')
GROUP BY trim("category");

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN "categoryId" TEXT;

-- Backfill categoryId from legacy category string
UPDATE "Equipment" e
SET "categoryId" = c."id"
FROM "EquipmentCategory" c
WHERE trim(e."category") = c."name";

UPDATE "Equipment"
SET "categoryId" = 'cat_overig'
WHERE "categoryId" IS NULL;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "category";
