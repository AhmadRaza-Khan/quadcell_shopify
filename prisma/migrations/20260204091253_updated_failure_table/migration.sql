/*
  Warnings:

  - You are about to drop the column `payload` on the `Failure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Failure" DROP COLUMN "payload",
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "message" TEXT;
