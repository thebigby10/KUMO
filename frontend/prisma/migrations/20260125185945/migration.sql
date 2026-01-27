/*
  Warnings:

  - You are about to drop the column `labWorkId` on the `lab_materials` table. All the data in the column will be lost.
  - You are about to drop the column `labWorkId` on the `lab_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `labWorkId` on the `submissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workId,userEmail]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workId` to the `lab_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workId` to the `lab_tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workId` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lab_materials" DROP CONSTRAINT "lab_materials_labWorkId_fkey";

-- DropForeignKey
ALTER TABLE "lab_tasks" DROP CONSTRAINT "lab_tasks_labWorkId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_labWorkId_fkey";

-- DropIndex
DROP INDEX "submissions_labWorkId_userEmail_key";

-- AlterTable
ALTER TABLE "lab_materials" DROP COLUMN "labWorkId",
ADD COLUMN     "workId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "lab_tasks" DROP COLUMN "labWorkId",
ADD COLUMN     "workId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "labWorkId",
ADD COLUMN     "workId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "submissions_workId_userEmail_key" ON "submissions"("workId", "userEmail");

-- AddForeignKey
ALTER TABLE "lab_tasks" ADD CONSTRAINT "lab_tasks_workId_fkey" FOREIGN KEY ("workId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_materials" ADD CONSTRAINT "lab_materials_workId_fkey" FOREIGN KEY ("workId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_workId_fkey" FOREIGN KEY ("workId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
