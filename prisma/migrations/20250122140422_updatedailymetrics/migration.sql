/*
  Warnings:

  - Made the column `productId` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `daily_metrics` DROP FOREIGN KEY `daily_metrics_productId_fkey`;

-- AlterTable
ALTER TABLE `daily_metrics` ADD COLUMN `availableSlots` INTEGER NULL,
    ADD COLUMN `callsTaken` INTEGER NULL,
    ADD COLUMN `offers` INTEGER NULL,
    ADD COLUMN `scheduledCalls` INTEGER NULL,
    MODIFY `productId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `daily_metrics` ADD CONSTRAINT `daily_metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
