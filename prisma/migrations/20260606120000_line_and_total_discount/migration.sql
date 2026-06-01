-- Line-level discounts
ALTER TABLE "ProjectLine" ADD COLUMN "discountType" "DiscountType";
ALTER TABLE "ProjectLine" ADD COLUMN "discountValue" DOUBLE PRECISION;

-- Project total discount as fixed amount (migrate existing AMOUNT discounts)
ALTER TABLE "Project" ADD COLUMN "totalDiscountAmount" DOUBLE PRECISION;

UPDATE "Project"
SET "totalDiscountAmount" = "discountValue"
WHERE "discountType" = 'AMOUNT' AND "discountValue" IS NOT NULL AND "discountValue" > 0;

ALTER TABLE "Project" DROP COLUMN "discountType";
ALTER TABLE "Project" DROP COLUMN "discountValue";
