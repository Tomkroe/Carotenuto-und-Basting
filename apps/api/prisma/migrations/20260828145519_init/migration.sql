-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'VERWALTER');

-- CreateEnum
CREATE TYPE "ObjektTyp" AS ENUM ('WOHN_GESCHAEFTSHAUS', 'EINHEITEN', 'EINFAMILIENHAUS', 'WEG');

-- CreateEnum
CREATE TYPE "KontaktTyp" AS ENUM ('MIETER', 'EIGENTUEMER', 'HAUSVERWALTUNG', 'DIENSTLEISTER', 'SONSTIGE');

-- CreateEnum
CREATE TYPE "MietvertragStatus" AS ENUM ('GEPLANT', 'AKTIV', 'BEENDET');

-- CreateEnum
CREATE TYPE "VorgangStatus" AS ENUM ('OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN');

-- CreateEnum
CREATE TYPE "ZaehlerTyp" AS ENUM ('STROM', 'GAS', 'WASSER');

-- CreateEnum
CREATE TYPE "NebenkostenStatus" AS ENUM ('ENTWURF', 'VERSENDET');

-- CreateEnum
CREATE TYPE "VerteilerSchluessel" AS ENUM ('QM', 'PERSONEN', 'VERBRAUCH', 'EINHEITEN');

-- CreateTable
CREATE TABLE "Mandant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mandant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VERWALTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objekt" (
    "id" TEXT NOT NULL,
    "typ" "ObjektTyp" NOT NULL,
    "name" TEXT NOT NULL,
    "strasse" TEXT NOT NULL,
    "hausnummer" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "ort" TEXT NOT NULL,
    "land" TEXT NOT NULL DEFAULT 'DE',
    "kaltmiete" DECIMAL(10,2),
    "flaeche" DECIMAL(10,2),
    "eigenschaften" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "Objekt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einheit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "flaeche" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objektId" TEXT NOT NULL,

    CONSTRAINT "Einheit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kontakt" (
    "id" TEXT NOT NULL,
    "typ" "KontaktTyp" NOT NULL,
    "vorname" TEXT,
    "nachname" TEXT,
    "firma" TEXT,
    "email" TEXT,
    "telefon" TEXT,
    "debitorNr" TEXT,
    "kreditorNr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "Kontakt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mietvertrag" (
    "id" TEXT NOT NULL,
    "kaltmiete" DECIMAL(10,2) NOT NULL,
    "nebenkostenVorauszahlung" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "beginn" TIMESTAMP(3) NOT NULL,
    "ende" TIMESTAMP(3),
    "status" "MietvertragStatus" NOT NULL DEFAULT 'GEPLANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "einheitId" TEXT NOT NULL,
    "mieterId" TEXT NOT NULL,

    CONSTRAINT "Mietvertrag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eigentuemerschaft" (
    "id" TEXT NOT NULL,
    "hausgeldAnteil" DECIMAL(10,2) NOT NULL,
    "anteilProzent" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "einheitId" TEXT NOT NULL,
    "eigentuemerId" TEXT NOT NULL,

    CONSTRAINT "Eigentuemerschaft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vorgang" (
    "id" TEXT NOT NULL,
    "nummer" SERIAL NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "status" "VorgangStatus" NOT NULL DEFAULT 'OFFEN',
    "startDatum" TIMESTAMP(3),
    "faelligkeit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,
    "objektId" TEXT,
    "einheitId" TEXT,
    "verantwortlicherId" TEXT,
    "kontaktId" TEXT,

    CONSTRAINT "Vorgang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farbe" TEXT NOT NULL,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VorgangLabel" (
    "vorgangId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "VorgangLabel_pkey" PRIMARY KEY ("vorgangId","labelId")
);

-- CreateTable
CREATE TABLE "ToDo" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "erledigt" BOOLEAN NOT NULL DEFAULT false,
    "faelligkeit" TIMESTAMP(3),
    "reihenfolge" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vorgangId" TEXT NOT NULL,

    CONSTRAINT "ToDo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kommentar" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vorgangId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "Kommentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zaehler" (
    "id" TEXT NOT NULL,
    "typ" "ZaehlerTyp" NOT NULL,
    "zaehlernummer" TEXT NOT NULL,
    "hauptzaehler" BOOLEAN NOT NULL DEFAULT true,
    "versorger" TEXT,
    "vertragsNr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,
    "objektId" TEXT,
    "einheitId" TEXT,

    CONSTRAINT "Zaehler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zaehlerstand" (
    "id" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "wert" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zaehlerId" TEXT NOT NULL,

    CONSTRAINT "Zaehlerstand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokument" (
    "id" TEXT NOT NULL,
    "dateiname" TEXT NOT NULL,
    "speicherKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "groesseBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,
    "hochgeladenVonId" TEXT NOT NULL,
    "objektId" TEXT,
    "vorgangId" TEXT,
    "mietvertragId" TEXT,
    "kommentarId" TEXT,

    CONSTRAINT "Dokument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nebenkostenabrechnung" (
    "id" TEXT NOT NULL,
    "zeitraumVon" TIMESTAMP(3) NOT NULL,
    "zeitraumBis" TIMESTAMP(3) NOT NULL,
    "status" "NebenkostenStatus" NOT NULL DEFAULT 'ENTWURF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objektId" TEXT NOT NULL,

    CONSTRAINT "Nebenkostenabrechnung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NebenkostenPosition" (
    "id" TEXT NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "betrag" DECIMAL(10,2) NOT NULL,
    "verteilerschluessel" "VerteilerSchluessel" NOT NULL,
    "nebenkostenabrechnungId" TEXT NOT NULL,

    CONSTRAINT "NebenkostenPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_mandantId_idx" ON "User"("mandantId");

-- CreateIndex
CREATE INDEX "Objekt_mandantId_idx" ON "Objekt"("mandantId");

-- CreateIndex
CREATE INDEX "Einheit_objektId_idx" ON "Einheit"("objektId");

-- CreateIndex
CREATE INDEX "Kontakt_mandantId_idx" ON "Kontakt"("mandantId");

-- CreateIndex
CREATE INDEX "Mietvertrag_einheitId_idx" ON "Mietvertrag"("einheitId");

-- CreateIndex
CREATE INDEX "Mietvertrag_mieterId_idx" ON "Mietvertrag"("mieterId");

-- CreateIndex
CREATE INDEX "Eigentuemerschaft_einheitId_idx" ON "Eigentuemerschaft"("einheitId");

-- CreateIndex
CREATE INDEX "Eigentuemerschaft_eigentuemerId_idx" ON "Eigentuemerschaft"("eigentuemerId");

-- CreateIndex
CREATE INDEX "Vorgang_mandantId_idx" ON "Vorgang"("mandantId");

-- CreateIndex
CREATE INDEX "Vorgang_objektId_idx" ON "Vorgang"("objektId");

-- CreateIndex
CREATE INDEX "Label_mandantId_idx" ON "Label"("mandantId");

-- CreateIndex
CREATE INDEX "ToDo_vorgangId_idx" ON "ToDo"("vorgangId");

-- CreateIndex
CREATE INDEX "Kommentar_vorgangId_idx" ON "Kommentar"("vorgangId");

-- CreateIndex
CREATE INDEX "Zaehler_mandantId_idx" ON "Zaehler"("mandantId");

-- CreateIndex
CREATE INDEX "Zaehlerstand_zaehlerId_idx" ON "Zaehlerstand"("zaehlerId");

-- CreateIndex
CREATE INDEX "Dokument_mandantId_idx" ON "Dokument"("mandantId");

-- CreateIndex
CREATE INDEX "Nebenkostenabrechnung_objektId_idx" ON "Nebenkostenabrechnung"("objektId");

-- CreateIndex
CREATE INDEX "NebenkostenPosition_nebenkostenabrechnungId_idx" ON "NebenkostenPosition"("nebenkostenabrechnungId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objekt" ADD CONSTRAINT "Objekt_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Einheit" ADD CONSTRAINT "Einheit_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kontakt" ADD CONSTRAINT "Kontakt_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietvertrag" ADD CONSTRAINT "Mietvertrag_einheitId_fkey" FOREIGN KEY ("einheitId") REFERENCES "Einheit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietvertrag" ADD CONSTRAINT "Mietvertrag_mieterId_fkey" FOREIGN KEY ("mieterId") REFERENCES "Kontakt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eigentuemerschaft" ADD CONSTRAINT "Eigentuemerschaft_einheitId_fkey" FOREIGN KEY ("einheitId") REFERENCES "Einheit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eigentuemerschaft" ADD CONSTRAINT "Eigentuemerschaft_eigentuemerId_fkey" FOREIGN KEY ("eigentuemerId") REFERENCES "Kontakt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vorgang" ADD CONSTRAINT "Vorgang_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vorgang" ADD CONSTRAINT "Vorgang_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vorgang" ADD CONSTRAINT "Vorgang_einheitId_fkey" FOREIGN KEY ("einheitId") REFERENCES "Einheit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vorgang" ADD CONSTRAINT "Vorgang_verantwortlicherId_fkey" FOREIGN KEY ("verantwortlicherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vorgang" ADD CONSTRAINT "Vorgang_kontaktId_fkey" FOREIGN KEY ("kontaktId") REFERENCES "Kontakt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VorgangLabel" ADD CONSTRAINT "VorgangLabel_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VorgangLabel" ADD CONSTRAINT "VorgangLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToDo" ADD CONSTRAINT "ToDo_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kommentar" ADD CONSTRAINT "Kommentar_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kommentar" ADD CONSTRAINT "Kommentar_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zaehler" ADD CONSTRAINT "Zaehler_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zaehler" ADD CONSTRAINT "Zaehler_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zaehler" ADD CONSTRAINT "Zaehler_einheitId_fkey" FOREIGN KEY ("einheitId") REFERENCES "Einheit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zaehlerstand" ADD CONSTRAINT "Zaehlerstand_zaehlerId_fkey" FOREIGN KEY ("zaehlerId") REFERENCES "Zaehler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_hochgeladenVonId_fkey" FOREIGN KEY ("hochgeladenVonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_mietvertragId_fkey" FOREIGN KEY ("mietvertragId") REFERENCES "Mietvertrag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokument" ADD CONSTRAINT "Dokument_kommentarId_fkey" FOREIGN KEY ("kommentarId") REFERENCES "Kommentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nebenkostenabrechnung" ADD CONSTRAINT "Nebenkostenabrechnung_objektId_fkey" FOREIGN KEY ("objektId") REFERENCES "Objekt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NebenkostenPosition" ADD CONSTRAINT "NebenkostenPosition_nebenkostenabrechnungId_fkey" FOREIGN KEY ("nebenkostenabrechnungId") REFERENCES "Nebenkostenabrechnung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
