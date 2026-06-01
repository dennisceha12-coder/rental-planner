-- Add client type (particulier vs bedrijf)
CREATE TYPE "ClientType" AS ENUM ('PARTICULIER', 'BEDRIJF');

ALTER TABLE "Client" ADD COLUMN "type" "ClientType" NOT NULL DEFAULT 'BEDRIJF';
