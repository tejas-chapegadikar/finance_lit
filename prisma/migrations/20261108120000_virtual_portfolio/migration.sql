-- InvestSmart's virtual portfolio: practice money only (virtual ₹1,00,000),
-- simulated months, holdings and a monthly history for the chart. Additive.

-- CreateTable
CREATE TABLE "VirtualPortfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cash" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "month" INTEGER NOT NULL DEFAULT 0,
    "run" INTEGER NOT NULL DEFAULT 1,
    "lastChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualHolding" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "invested" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VirtualHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VirtualSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualPortfolio_userId_key" ON "VirtualPortfolio"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualHolding_portfolioId_asset_key" ON "VirtualHolding"("portfolioId", "asset");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualSnapshot_portfolioId_month_key" ON "VirtualSnapshot"("portfolioId", "month");

-- AddForeignKey
ALTER TABLE "VirtualPortfolio" ADD CONSTRAINT "VirtualPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualHolding" ADD CONSTRAINT "VirtualHolding_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "VirtualPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualSnapshot" ADD CONSTRAINT "VirtualSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "VirtualPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

