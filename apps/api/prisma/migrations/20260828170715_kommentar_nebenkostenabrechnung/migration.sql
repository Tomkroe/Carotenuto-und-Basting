-- AlterTable
ALTER TABLE "Kommentar" ADD COLUMN     "nebenkostenabrechnungId" TEXT,
ALTER COLUMN "vorgangId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Kommentar_nebenkostenabrechnungId_idx" ON "Kommentar"("nebenkostenabrechnungId");

-- AddForeignKey
ALTER TABLE "Kommentar" ADD CONSTRAINT "Kommentar_nebenkostenabrechnungId_fkey" FOREIGN KEY ("nebenkostenabrechnungId") REFERENCES "Nebenkostenabrechnung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
