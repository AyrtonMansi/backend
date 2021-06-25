-- CreateEnum
CREATE TYPE "graph_timeframe" AS ENUM ('Day', 'Week', 'Month', 'Year', 'FiveYrs', 'MAX');

-- CreateEnum
CREATE TYPE "technical_timeframe" AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "prices" JSONB[],
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

-- AddForeignKey
ALTER TABLE "Price" ADD FOREIGN KEY ("stocksId") REFERENCES "Stocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
