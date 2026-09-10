-- CreateEnum
CREATE TYPE "ForderungTyp" AS ENUM ('MIETE', 'KAUTION');

-- CreateEnum
CREATE TYPE "ForderungStatusWert" AS ENUM ('BEZAHLT', 'VERLOREN');

-- CreateEnum
CREATE TYPE "BelegTyp" AS ENUM ('EINNAHME', 'AUSGABE');

-- CreateEnum
CREATE TYPE "BelegStatus" AS ENUM ('OFFEN', 'BEZAHLT');

-- CreateTable
CREATE TABLE "ForderungStatus" (
    "id" TEXT NOT NULL,
    "typ" "ForderungTyp" NOT NULL,
    "periode" TEXT NOT NULL,
    "status" "ForderungStatusWert" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mietvertragId" TEXT NOT NULL,

    CONSTRAINT "ForderungStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beleg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "belegnummer" TEXT,
    "typ" "BelegTyp" NOT NULL DEFAULT 'AUSGABE',
    "betrag" DECIMAL(10,2) NOT NULL,
    "belegdatum" TIMESTAMP(3) NOT NULL,
    "status" "BelegStatus" NOT NULL DEFAULT 'OFFEN',
    "notiz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,
    "objektId" TEXT,
    "kategorieId" TEXT,

    CONSTRAINT "Beleg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForderungStatus_mietvertragId_idx" ON "ForderungStatus"("mietvertragId");

-- CreateIndex
CREATE UNIQUE INDEX "ForderungStatus_mietvertragId_typ_periode_key" ON "ForderungStatus"("mietvertragId", "typ", "periode");

-- CreateIndex
CREATE INDEX "Beleg_mandantId_idx" ON "Beleg"("mandantId");

-- CreateIndex
CREATE INDEX "Beleg_objektId_idx" ON "Beleg"("objektId");

-- AddForeignKey
ALTER TABLE "ForderungStatus" ADD CONSTRAINT "ForderungStatus_mietvertragId_fkey" FOREIGN KEY ("mietvertragId") REFERENCES "Mietvertrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beleg" ADD CONSTRAINT "Beleg_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beleg" ADD CONSTRAINT "Beleg_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beleg" ADD CONSTRAINT "Beleg_kategorieId_fkey" FOREIGN KEY ("kategorieId") REFERENCES "DokumentKategorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
