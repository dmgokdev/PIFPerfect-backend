/*
  Warnings:

  - You are about to drop the column `cashCollected` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `cashRevenue` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `convos` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `liveCalls` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsCalendar` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsClosed` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsOffered` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalDials` on the `daily_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalLeads` on the `daily_metrics` table. All the data in the column will be lost.
  - Made the column `availableSlots` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `callsTaken` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `offers` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productId` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scheduledCalls` on table `daily_metrics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `daily_metrics` DROP FOREIGN KEY `daily_metrics_productId_fkey`;

-- AlterTable
ALTER TABLE `daily_metrics` DROP COLUMN `cashCollected`,
    DROP COLUMN `cashRevenue`,
    DROP COLUMN `convos`,
    DROP COLUMN `liveCalls`,
    DROP COLUMN `sets`,
    DROP COLUMN `setsCalendar`,
    DROP COLUMN `setsClosed`,
    DROP COLUMN `setsOffered`,
    DROP COLUMN `totalDials`,
    DROP COLUMN `totalLeads`,
    MODIFY `availableSlots` INTEGER NOT NULL,
    MODIFY `callsTaken` INTEGER NOT NULL,
    MODIFY `offers` INTEGER NOT NULL,
    MODIFY `productId` INTEGER NOT NULL,
    MODIFY `scheduledCalls` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `daily_metrics` ADD CONSTRAINT `daily_metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
