-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'email';

-- CreateTable
CREATE TABLE "labs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT,
    "subject" TEXT,
    "room" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "labCode" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ASSISTANT',

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "announcementId" TEXT NOT NULL,

    CONSTRAINT "announcement_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_works" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 100,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tasks" (
    "id" TEXT NOT NULL,
    "labWorkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "point" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_materials" (
    "id" TEXT NOT NULL,
    "labWorkId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "lab_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_materials" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT,

    CONSTRAINT "task_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectOutput" TEXT NOT NULL,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editors" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,

    CONSTRAINT "editors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hints" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "hint" TEXT NOT NULL,

    CONSTRAINT "hints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "labs_labCode_key" ON "labs"("labCode");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userEmail_labId_key" ON "enrollments"("userEmail", "labId");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_labId_userEmail_key" ON "instructors"("labId", "userEmail");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_postedBy_fkey" FOREIGN KEY ("postedBy") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_materials" ADD CONSTRAINT "announcement_materials_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_works" ADD CONSTRAINT "lab_works_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tasks" ADD CONSTRAINT "lab_tasks_labWorkId_fkey" FOREIGN KEY ("labWorkId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_materials" ADD CONSTRAINT "lab_materials_labWorkId_fkey" FOREIGN KEY ("labWorkId") REFERENCES "lab_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_materials" ADD CONSTRAINT "task_materials_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editors" ADD CONSTRAINT "editors_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "lab_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
