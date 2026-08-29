-- CreateTable
CREATE TABLE "VorgangVerlauf" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vorgangId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "VorgangVerlauf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VorgangVerlauf_vorgangId_idx" ON "VorgangVerlauf"("vorgangId");

-- AddForeignKey
ALTER TABLE "VorgangVerlauf" ADD CONSTRAINT "VorgangVerlauf_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VorgangVerlauf" ADD CONSTRAINT "VorgangVerlauf_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
