-- AlterEnum
ALTER TYPE "KontaktTyp" ADD VALUE 'HAUSMEISTER';

-- AlterTable
ALTER TABLE "Eigentuemerschaft" ADD COLUMN     "seit" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Einheit" ADD COLUMN     "istSev" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Kontakt" ADD COLUMN     "typBezeichnung" TEXT;
