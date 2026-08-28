-- AlterTable
ALTER TABLE "Dokument" ADD COLUMN     "nebenkostenabrechnungId" TEXT;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_nebenkostenabrechnungId_fkey" FOREIGN KEY ("nebenkostenabrechnungId") REFERENCES "Nebenkostenabrechnung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
