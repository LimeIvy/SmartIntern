/*
  Warnings:

  - You are about to drop the column `url` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "url",
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "CompanyUrl" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyUrl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyUrl" ADD CONSTRAINT "CompanyUrl_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
