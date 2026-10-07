-- Safe: 'NONE' was committed in the previous migration transaction.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'NONE';

ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "consentAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "erasedAt" TIMESTAMP(3);
