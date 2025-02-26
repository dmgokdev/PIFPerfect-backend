/*
  Warnings:

  - You are about to drop the column `availableSlots` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `callsTaken` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `offers` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledCalls` on the `daily_metrics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `daily_metrics` DROP FOREIGN KEY `daily_metrics_productId_fkey`;

-- AlterTable
ALTER TABLE `daily_metrics` DROP COLUMN `availableSlots`,
    DROP COLUMN `callsTaken`,
    DROP COLUMN `offers`,
    DROP COLUMN `scheduledCalls`,
    MODIFY `productId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `daily_metrics` ADD CONSTRAINT `daily_metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
