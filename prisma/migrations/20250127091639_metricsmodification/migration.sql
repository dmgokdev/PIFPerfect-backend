-- AlterTable
ALTER TABLE `metrics` ADD COLUMN `productId` INTEGER NULL;

-- AlterTable
ALTER TABLE `projections` MODIFY `period` ENUM('weekly', 'monthly', 'quarterly', 'yearly') NOT NULL;

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
