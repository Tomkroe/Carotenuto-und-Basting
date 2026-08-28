-- AlterTable
ALTER TABLE "Kommentar" ADD COLUMN     "kontaktId" TEXT;

-- CreateIndex
CREATE INDEX "Kommentar_kontaktId_idx" ON "Kommentar"("kontaktId");

-- AddForeignKey
ALTER TABLE "Kommentar" ADD CONSTRAINT "Kommentar_kontaktId_fkey" FOREIGN KEY ("kontaktId") REFERENCES "Kontakt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
