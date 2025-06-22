-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "learned" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EsStock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "baseStoryId" TEXT,

    CONSTRAINT "EsStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedEs" (
    "id" TEXT NOT NULL,
    "selectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "baseStockId" TEXT,

    CONSTRAINT "SubmittedEs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EsStock" ADD CONSTRAINT "EsStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EsStock" ADD CONSTRAINT "EsStock_baseStoryId_fkey" FOREIGN KEY ("baseStoryId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedEs" ADD CONSTRAINT "SubmittedEs_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES "Selection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedEs" ADD CONSTRAINT "SubmittedEs_baseStockId_fkey" FOREIGN KEY ("baseStockId") REFERENCES "EsStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
