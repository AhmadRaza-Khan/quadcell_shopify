-- AlterTable
ALTER TABLE "public"."Test" ADD COLUMN     "jsonPayload" JSONB,
ALTER COLUMN "payload" DROP NOT NULL;
