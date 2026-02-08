-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "courseId" TEXT;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
