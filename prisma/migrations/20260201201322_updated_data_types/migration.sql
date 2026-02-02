-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "orderId" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Subscriber" ALTER COLUMN "customerId" SET DATA TYPE TEXT;
