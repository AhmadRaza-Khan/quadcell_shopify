-- CreateTable
CREATE TABLE "public"."Esim" (
    "id" SERIAL NOT NULL,
    "imsi" INTEGER NOT NULL,
    "iccid" INTEGER NOT NULL,
    "msisdn" INTEGER NOT NULL,
    "lpa" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Esim_pkey" PRIMARY KEY ("id")
);
