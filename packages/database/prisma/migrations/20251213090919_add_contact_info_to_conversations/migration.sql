-- AlterTable
ALTER TABLE "AIConversation" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- CreateIndex
CREATE INDEX "AIConversation_contactEmail_idx" ON "AIConversation"("contactEmail");
