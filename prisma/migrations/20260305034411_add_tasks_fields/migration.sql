-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "completedTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tasks" JSONB;
