/*
  Warnings:

  - Added the required column `companyFitScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `growthScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logicScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specificityScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starStructureScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalScore` to the `InterviewAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewAnswer" ADD COLUMN     "companyFitScore" INTEGER NOT NULL,
ADD COLUMN     "growthScore" INTEGER NOT NULL,
ADD COLUMN     "logicScore" INTEGER NOT NULL,
ADD COLUMN     "specificityScore" INTEGER NOT NULL,
ADD COLUMN     "starStructureScore" INTEGER NOT NULL,
ADD COLUMN     "totalScore" INTEGER NOT NULL;
