/*
  Warnings:

  - You are about to drop the column `barcode` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `stores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,locality]` on the table `stores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `products` table. Existing records will be updated with default value 0.00.
  - Added the required column `locality` to the `stores` table. Existing records will be updated with default value 'Unknown'.

*/
-- DropIndex
DROP INDEX "products_barcode_idx";

-- DropIndex
DROP INDEX "products_category_idx";

-- DropIndex
DROP INDEX "products_sku_idx";

-- DropIndex
DROP INDEX "products_sku_key";

-- DropIndex
DROP INDEX "stores_city_idx";

-- DropIndex
DROP INDEX "stores_code_idx";

-- DropIndex
DROP INDEX "stores_code_key";

-- DropIndex
DROP INDEX "stores_name_address_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "barcode",
DROP COLUMN "category",
DROP COLUMN "image_url",
DROP COLUMN "sku",
DROP COLUMN "unit_price",
ADD COLUMN     "price" DECIMAL(12,2);

-- Update existing products with default price (e.g., 0.00 or from unit_price if available)
UPDATE "products" SET "price" = 0.00 WHERE "price" IS NULL;

-- Make price column NOT NULL after updating data
ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "code",
DROP COLUMN "country",
DROP COLUMN "email",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "metadata",
DROP COLUMN "phone",
DROP COLUMN "state",
DROP COLUMN "zip_code",
ADD COLUMN     "locality" VARCHAR(100),
ADD COLUMN     "zone" VARCHAR(100);

-- Update existing stores with default locality
UPDATE "stores" SET "locality" = 'Unknown' WHERE "locality" IS NULL;

-- Make locality column NOT NULL after updating data
ALTER TABLE "stores" ALTER COLUMN "locality" SET NOT NULL;

-- CreateIndex
CREATE INDEX "stores_locality_idx" ON "stores"("locality");

-- CreateIndex
CREATE INDEX "stores_zone_idx" ON "stores"("zone");

-- CreateIndex
CREATE UNIQUE INDEX "stores_name_locality_key" ON "stores"("name", "locality");
