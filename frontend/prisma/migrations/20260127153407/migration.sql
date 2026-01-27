/*
  Warnings:

  - Added the required column `language` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "language" TEXT NOT NULL;
