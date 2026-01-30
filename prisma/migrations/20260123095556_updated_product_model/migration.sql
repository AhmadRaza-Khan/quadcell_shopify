/*
  Warnings:

  - You are about to drop the column `placnCode` on the `Product` table. All the data in the column will be lost.
  - The `lifeCycle` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "placnCode",
ADD COLUMN     "planCode" INTEGER,
DROP COLUMN "lifeCycle",
ADD COLUMN     "lifeCycle" INTEGER;
