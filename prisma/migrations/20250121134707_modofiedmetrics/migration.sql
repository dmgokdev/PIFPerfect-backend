/*
  Warnings:

  - You are about to drop the column `calculationMethod` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `convos` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `liveCalls` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `salesTarget` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsCalendar` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsClosed` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `setsOffered` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalDials` on the `metrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalLeads` on the `metrics` table. All the data in the column will be lost.
  - Added the required column `name` to the `metrics` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `metrics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `metrics` DROP FOREIGN KEY `metrics_createdBy_fkey`;

-- AlterTable
ALTER TABLE `daily_metrics` ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `value` DOUBLE NULL;

-- AlterTable
ALTER TABLE `metrics` DROP COLUMN `calculationMethod`,
    DROP COLUMN `convos`,
    DROP COLUMN `currency`,
    DROP COLUMN `description`,
    DROP COLUMN `label`,
    DROP COLUMN `liveCalls`,
    DROP COLUMN `salesTarget`,
    DROP COLUMN `sets`,
    DROP COLUMN `setsCalendar`,
    DROP COLUMN `setsClosed`,
    DROP COLUMN `setsOffered`,
    DROP COLUMN `totalDials`,
    DROP COLUMN `totalLeads`,
    ADD COLUMN `isCalculated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `value1` VARCHAR(191) NULL,
    ADD COLUMN `value2` VARCHAR(191) NULL,
    MODIFY `type` ENUM('NUMBER', 'CURRENCY', 'PERCENTAGE') NOT NULL,
    MODIFY `createdBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `status` VARCHAR(100) NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
