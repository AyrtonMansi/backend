-- CreateEnum
CREATE TYPE "graph_timeframe" AS ENUM ('Day', 'Week', 'Month', 'Year', 'FiveYrs', 'MAX');

-- CreateEnum
CREATE TYPE "technical_timeframe" AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,
    "high" TEXT NOT NULL,
    "low" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "stocksId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stocks" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "day_change" TEXT NOT NULL,
    "wk_change" TEXT NOT NULL,
    "market_cap" INTEGER NOT NULL,
    "day_vol" INTEGER NOT NULL,
    "supply" INTEGER NOT NULL,
    "previous_close" TEXT NOT NULL,
    "day_range" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "EPS" DOUBLE PRECISION NOT NULL,
    "yr_range" TEXT NOT NULL,
    "PE_ratio" DOUBLE PRECISION NOT NULL,
    "ave_volume" DOUBLE PRECISION NOT NULL,
    "dividend" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Price" ADD FOREIGN KEY ("stocksId") REFERENCES "Stocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
