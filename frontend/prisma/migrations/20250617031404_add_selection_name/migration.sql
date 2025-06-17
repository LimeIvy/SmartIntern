/*
  Warnings:

  - Added the required column `name` to the `Selection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Selection" ADD COLUMN     "name" TEXT NOT NULL;
