-- CreateEnum
CREATE TYPE "graph_timeframe" AS ENUM ('Day', 'Week', 'Month', 'Year', 'FiveYrs', 'MAX');

-- CreateEnum
CREATE TYPE "technical_timeframe" AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "prices" JSONB NOT NULL,
    "stocksId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stocks" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "day_change" DOUBLE PRECISION NOT NULL,
    "wk_change" TEXT NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "day_vol" INTEGER NOT NULL,
    "supply" DOUBLE PRECISION NOT NULL,
    "previous_close" DOUBLE PRECISION NOT NULL,
    "day_range" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "EPS" DOUBLE PRECISION NOT NULL,
    "yr_range" TEXT NOT NULL,
    "PE_ratio" DOUBLE PRECISION NOT NULL,
    "ave_volume" DOUBLE PRECISION NOT NULL,
    "dividend" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockInfo" (
    "id" SERIAL NOT NULL,
    "stocksId" INTEGER,
    "previous_close" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "ave_volume" DOUBLE PRECISION NOT NULL,
    "day_min" DOUBLE PRECISION NOT NULL,
    "day_max" DOUBLE PRECISION NOT NULL,
    "yearly_min" DOUBLE PRECISION NOT NULL,
    "yearly_max" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockInfo.stocksId_unique" ON "StockInfo"("stocksId");

-- AddForeignKey
ALTER TABLE "StockInfo" ADD FOREIGN KEY ("stocksId") REFERENCES "Stocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD FOREIGN KEY ("stocksId") REFERENCES "Stocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
