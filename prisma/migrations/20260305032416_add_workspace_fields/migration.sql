-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "code" TEXT,
ADD COLUMN     "starterCode" TEXT;

-- CreateTable
CREATE TABLE "MilestoneMessage" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestoneMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MilestoneMessage" ADD CONSTRAINT "MilestoneMessage_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
