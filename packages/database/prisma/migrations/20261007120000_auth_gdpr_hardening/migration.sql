-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'NONE';

-- AlterTable user
ALTER TABLE "user" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'NONE';

-- AlterTable Enrollment
ALTER TABLE "Enrollment" ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enrollment" ADD COLUMN "consentAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "erasedAt" TIMESTAMP(3);
