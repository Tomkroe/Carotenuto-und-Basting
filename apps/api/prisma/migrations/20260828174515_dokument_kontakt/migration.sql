-- AlterTable
ALTER TABLE "Dokument" ADD COLUMN     "kontaktId" TEXT;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_kontaktId_fkey" FOREIGN KEY ("kontaktId") REFERENCES "Kontakt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
