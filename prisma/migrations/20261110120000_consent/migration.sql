-- Record when each person agreed to the Terms and Privacy Policy. Additive.
ALTER TABLE "User" ADD COLUMN "consentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "consentVersion" TEXT;
