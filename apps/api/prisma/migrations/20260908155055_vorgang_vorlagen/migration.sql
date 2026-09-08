-- CreateTable
CREATE TABLE "VorgangVorlage" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandantId" TEXT NOT NULL,

    CONSTRAINT "VorgangVorlage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VorlageLabel" (
    "vorlageId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "VorlageLabel_pkey" PRIMARY KEY ("vorlageId","labelId")
);

-- CreateIndex
CREATE INDEX "VorgangVorlage_mandantId_idx" ON "VorgangVorlage"("mandantId");

-- AddForeignKey
ALTER TABLE "VorgangVorlage" ADD CONSTRAINT "VorgangVorlage_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VorlageLabel" ADD CONSTRAINT "VorlageLabel_vorlageId_fkey" FOREIGN KEY ("vorlageId") REFERENCES "VorgangVorlage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VorlageLabel" ADD CONSTRAINT "VorlageLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
