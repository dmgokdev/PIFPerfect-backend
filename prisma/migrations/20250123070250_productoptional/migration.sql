-- DropForeignKey
ALTER TABLE `daily_metrics` DROP FOREIGN KEY `daily_metrics_productId_fkey`;

-- AlterTable
ALTER TABLE `daily_metrics` MODIFY `productId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `daily_metrics` ADD CONSTRAINT `daily_metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
