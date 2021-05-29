/*
  Warnings:

  - Changed the type of `day_change` on the `Stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `previous_close` on the `Stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dividend` on the `Stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Stocks" DROP COLUMN "day_change",
ADD COLUMN     "day_change" DOUBLE PRECISION NOT NULL,
DROP COLUMN "previous_close",
ADD COLUMN     "previous_close" DOUBLE PRECISION NOT NULL,
DROP COLUMN "dividend",
ADD COLUMN     "dividend" DOUBLE PRECISION NOT NULL;
