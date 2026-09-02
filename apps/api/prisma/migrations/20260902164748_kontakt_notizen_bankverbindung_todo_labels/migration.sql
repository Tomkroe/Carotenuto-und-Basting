-- AlterTable
ALTER TABLE "Kontakt" ADD COLUMN     "bankBic" TEXT,
ADD COLUMN     "bankGlaeubigerId" TEXT,
ADD COLUMN     "bankIban" TEXT,
ADD COLUMN     "bankKontoinhaber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "notizen" TEXT;

-- CreateTable
CREATE TABLE "ToDoLabel" (
    "todoId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "ToDoLabel_pkey" PRIMARY KEY ("todoId","labelId")
);

-- AddForeignKey
ALTER TABLE "ToDoLabel" ADD CONSTRAINT "ToDoLabel_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "ToDo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToDoLabel" ADD CONSTRAINT "ToDoLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
