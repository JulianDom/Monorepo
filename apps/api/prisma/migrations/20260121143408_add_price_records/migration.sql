-- CreateTable
CREATE TABLE "price_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "operative_user_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "recorded_at" TIMESTAMPTZ(3) NOT NULL,
    "notes" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "price_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_records_product_id_idx" ON "price_records"("product_id");

-- CreateIndex
CREATE INDEX "price_records_store_id_idx" ON "price_records"("store_id");

-- CreateIndex
CREATE INDEX "price_records_operative_user_id_idx" ON "price_records"("operative_user_id");

-- CreateIndex
CREATE INDEX "price_records_recorded_at_idx" ON "price_records"("recorded_at");

-- CreateIndex
CREATE INDEX "price_records_deleted_at_idx" ON "price_records"("deleted_at");

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_operative_user_id_fkey" FOREIGN KEY ("operative_user_id") REFERENCES "operative_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
