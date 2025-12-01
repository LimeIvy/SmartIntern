/*
  Warnings:

  - Made the column `endDate` on table `Schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "endDate" SET NOT NULL;
