/*
  Warnings:

  - You are about to drop the column `productId` on the `metrics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `metrics` DROP FOREIGN KEY `metrics_productId_fkey`;

-- AlterTable
ALTER TABLE `metrics` DROP COLUMN `productId`;

-- CreateTable
CREATE TABLE `metrics_products` (
    `metricId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`metricId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `metrics_products` ADD CONSTRAINT `metrics_products_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `metrics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metrics_products` ADD CONSTRAINT `metrics_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
