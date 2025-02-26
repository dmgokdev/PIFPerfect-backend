/*
  Warnings:

  - You are about to drop the column `value1` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `value2` on the `metrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `metrics` DROP COLUMN `value1`,
    DROP COLUMN `value2`,
    ADD COLUMN `value1Id` INTEGER NULL,
    ADD COLUMN `value2Id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_value1Id_fkey` FOREIGN KEY (`value1Id`) REFERENCES `metrics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_value2Id_fkey` FOREIGN KEY (`value2Id`) REFERENCES `metrics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
