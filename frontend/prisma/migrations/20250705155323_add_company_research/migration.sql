/*
  Warnings:

  - Added the required column `companyResearch` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "companyResearch" TEXT NOT NULL;
