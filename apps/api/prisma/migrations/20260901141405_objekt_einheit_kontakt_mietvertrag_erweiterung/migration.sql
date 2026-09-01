-- AlterTable
ALTER TABLE "Einheit" ADD COLUMN     "ausstattung" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "kaltmiete" DECIMAL(10,2),
ADD COLUMN     "zimmer" DECIMAL(3,1);

-- AlterTable
ALTER TABLE "Kontakt" ADD COLUMN     "adresseHausnummer" TEXT,
ADD COLUMN     "adresseOrt" TEXT,
ADD COLUMN     "adressePlz" TEXT,
ADD COLUMN     "adresseStrasse" TEXT,
ADD COLUMN     "geburtsdatum" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Mietvertrag" ADD COLUMN     "iban" TEXT,
ADD COLUMN     "kaution" DECIMAL(10,2),
ADD COLUMN     "sepaLastschrift" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Objekt" ADD COLUMN     "ansprechpartnerId" TEXT,
ADD COLUMN     "hausgeld" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "Objekt" ADD CONSTRAINT "Objekt_ansprechpartnerId_fkey" FOREIGN KEY ("ansprechpartnerId") REFERENCES "Kontakt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
