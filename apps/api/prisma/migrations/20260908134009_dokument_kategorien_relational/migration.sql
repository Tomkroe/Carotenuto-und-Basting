-- Preserve the legacy enum value in a plain text column before touching the enum,
-- since the new "DokumentKategorie" table needs that exact name (Postgres won't
-- allow a table and an enum type of the same name to coexist).
ALTER TABLE "Dokument" ADD COLUMN "kategorieLegacy" TEXT;
UPDATE "Dokument" SET "kategorieLegacy" = "kategorie"::text;
ALTER TABLE "Dokument" DROP COLUMN "kategorie";

-- DropEnum
DROP TYPE "DokumentKategorie";

-- CreateTable
CREATE TABLE "DokumentKategorie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "DokumentKategorie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DokumentKategorie_mandantId_idx" ON "DokumentKategorie"("mandantId");

-- AddForeignKey
ALTER TABLE "DokumentKategorie" ADD CONSTRAINT "DokumentKategorie_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the previously fixed category set for every existing Mandant, so nothing
-- that was selectable before disappears — users can rename/delete/add from here.
INSERT INTO "DokumentKategorie" ("id", "name", "mandantId")
SELECT gen_random_uuid()::text, label."name", m."id"
FROM "Mandant" m
CROSS JOIN (VALUES
    ('ANSCHAFFUNGSKOSTEN', 'Anschaffungskosten'),
    ('BETRIEBS_NEBENKOSTEN', 'Betriebs-/Nebenkosten'),
    ('FINANZIERUNG_KREDITE_VERSICHERUNGEN', 'Finanzierung, Kredite & Versicherungen'),
    ('INDIVIDUELLE_KOSTEN', 'Individuelle Kosten'),
    ('MIETE_NEBENKOSTEN_KAUTION', 'Miete, Nebenkosten & Kaution'),
    ('RENOVIERUNG_REPARATUR_INVESTITIONEN', 'Renovierung/Reparatur & Investitionen'),
    ('SONSTIGE_AUSGABEN', 'Sonstige Ausgaben'),
    ('SONSTIGE_EINNAHMEN', 'Sonstige Einnahmen')
) AS label("enumValue", "name");

-- AlterTable: add the new relation column
ALTER TABLE "Dokument" ADD COLUMN "kategorieId" TEXT;

-- Backfill kategorieId from the preserved legacy value, matching the seeded row
-- for the same Mandant and the same legacy enum value.
UPDATE "Dokument" d
SET "kategorieId" = dk."id"
FROM "DokumentKategorie" dk,
     (VALUES
        ('ANSCHAFFUNGSKOSTEN', 'Anschaffungskosten'),
        ('BETRIEBS_NEBENKOSTEN', 'Betriebs-/Nebenkosten'),
        ('FINANZIERUNG_KREDITE_VERSICHERUNGEN', 'Finanzierung, Kredite & Versicherungen'),
        ('INDIVIDUELLE_KOSTEN', 'Individuelle Kosten'),
        ('MIETE_NEBENKOSTEN_KAUTION', 'Miete, Nebenkosten & Kaution'),
        ('RENOVIERUNG_REPARATUR_INVESTITIONEN', 'Renovierung/Reparatur & Investitionen'),
        ('SONSTIGE_AUSGABEN', 'Sonstige Ausgaben'),
        ('SONSTIGE_EINNAHMEN', 'Sonstige Einnahmen')
     ) AS label("enumValue", "name")
WHERE d."kategorieLegacy" = label."enumValue"
  AND dk."mandantId" = d."mandantId"
  AND dk."name" = label."name";

ALTER TABLE "Dokument" DROP COLUMN "kategorieLegacy";

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_kategorieId_fkey" FOREIGN KEY ("kategorieId") REFERENCES "DokumentKategorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
