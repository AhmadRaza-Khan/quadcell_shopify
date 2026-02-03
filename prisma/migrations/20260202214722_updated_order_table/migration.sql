/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Test";

-- CreateTable
CREATE TABLE "public"."Failure" (
    "id" TEXT NOT NULL,
    "payload" TEXT,
    "jsonPayload" JSONB,

    CONSTRAINT "Failure_pkey" PRIMARY KEY ("id")
);
