-- AlterTable
ALTER TABLE "Objekt" ADD COLUMN     "abrechnungszeitraumEnde" TEXT DEFAULT '31-12',
ADD COLUMN     "abrechnungszeitraumStart" TEXT DEFAULT '01-01',
ADD COLUMN     "bankBic" TEXT,
ADD COLUMN     "bankIban" TEXT,
ADD COLUMN     "bankKontoinhaber" TEXT,
ADD COLUMN     "titelbildKey" TEXT;
