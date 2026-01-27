/*
  Warnings:

  - A unique constraint covering the columns `[taskId,userEmail]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "submissions_workId_userEmail_key";

-- CreateIndex
CREATE UNIQUE INDEX "submissions_taskId_userEmail_key" ON "submissions"("taskId", "userEmail");
