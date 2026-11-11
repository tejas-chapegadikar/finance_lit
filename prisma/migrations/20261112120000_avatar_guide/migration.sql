-- Avatar guide: roast level and seen tips. Additive.
ALTER TABLE "User" ADD COLUMN "roastLevel" TEXT NOT NULL DEFAULT 'spicy';

CREATE TABLE "SeenTip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeenTip_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeenTip_userId_tipId_key" ON "SeenTip"("userId", "tipId");

ALTER TABLE "SeenTip" ADD CONSTRAINT "SeenTip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
