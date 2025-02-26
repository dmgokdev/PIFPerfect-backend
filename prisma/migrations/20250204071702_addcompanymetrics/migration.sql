/*
  Warnings:

  - You are about to drop the column `companyId` on the `metrics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `metrics` DROP FOREIGN KEY `metrics_companyId_fkey`;

-- AlterTable
ALTER TABLE `metrics` DROP COLUMN `companyId`;

-- CreateTable
CREATE TABLE `company_metric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `metricId` INTEGER NOT NULL,
    `label` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `company_metric` ADD CONSTRAINT `company_metric_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_metric` ADD CONSTRAINT `company_metric_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `metrics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
