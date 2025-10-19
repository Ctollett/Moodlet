/*
  Warnings:

  - You are about to drop the column `positionX` on the `elements` table. All the data in the column will be lost.
  - You are about to drop the column `positionY` on the `elements` table. All the data in the column will be lost.
  - Added the required column `position_x` to the `elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_y` to the `elements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "elements" DROP COLUMN "positionX",
DROP COLUMN "positionY",
ADD COLUMN     "position_x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "position_y" DOUBLE PRECISION NOT NULL;
