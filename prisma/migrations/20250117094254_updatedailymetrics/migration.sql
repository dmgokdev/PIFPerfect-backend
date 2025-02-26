-- AlterTable
ALTER TABLE `daily_metrics` ADD COLUMN `availableSlots` INTEGER NULL,
    ADD COLUMN `callsTaken` INTEGER NULL,
    ADD COLUMN `offers` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NULL,
    ADD COLUMN `scheduledCalls` INTEGER NULL,
    MODIFY `totalLeads` INTEGER NULL,
    MODIFY `totalDials` INTEGER NULL,
    MODIFY `convos` INTEGER NULL,
    MODIFY `sets` INTEGER NULL,
    MODIFY `setsCalendar` INTEGER NULL,
    MODIFY `liveCalls` INTEGER NULL,
    MODIFY `setsOffered` INTEGER NULL,
    MODIFY `setsClosed` INTEGER NULL,
    MODIFY `cashCollected` DOUBLE NULL,
    MODIFY `cashRevenue` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `daily_metrics` ADD CONSTRAINT `daily_metrics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
