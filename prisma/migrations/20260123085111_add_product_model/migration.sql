-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "imsi" INTEGER NOT NULL,
    "msisdn" TEXT NOT NULL,
    "name" TEXT,
    "coverage" TEXT,
    "description" TEXT,
    "data" TEXT,
    "lifeCycle" TEXT,
    "validityMode" TEXT,
    "speedControlMode" TEXT,
    "initialSpeed" TEXT,
    "price" DOUBLE PRECISION,
    "speedControllTier1" TEXT,
    "speedControllTier2" TEXT,
    "placnCode" INTEGER,
    "packCode" INTEGER,
    "fupCode" INTEGER,
    "productId" TEXT,
    "variantId" TEXT,
    "inventoryItemId" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");
