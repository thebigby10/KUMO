-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED');

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "labWorkId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "grade" INTEGER,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_records" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "submission_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submissions_labWorkId_userEmail_key" ON "submissions"("labWorkId", "userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "submission_records_submissionId_taskId_key" ON "submission_records"("submissionId", "taskId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_labWorkId_fkey" FOREIGN KEY ("labWorkId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_records" ADD CONSTRAINT "submission_records_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_records" ADD CONSTRAINT "submission_records_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
