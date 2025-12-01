/*
  Warnings:

  - You are about to drop the `CompanyUrl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompanyUrl" DROP CONSTRAINT "CompanyUrl_companyId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "hpUrl" TEXT,
ADD COLUMN     "mypageUrl" TEXT;

-- DropTable
DROP TABLE "CompanyUrl";
