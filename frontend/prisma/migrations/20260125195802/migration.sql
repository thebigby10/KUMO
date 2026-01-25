/*
  Warnings:

  - You are about to drop the `submission_records` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `code` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "submission_records" DROP CONSTRAINT "submission_records_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "submission_records" DROP CONSTRAINT "submission_records_taskId_fkey";

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "taskId" TEXT NOT NULL;

-- DropTable
DROP TABLE "submission_records";

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
