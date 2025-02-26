/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `industries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `companies` ADD COLUMN `currencySymbol` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `industries` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `parent_id` INTEGER NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `industries_name_key` ON `industries`(`name`);

-- AddForeignKey
ALTER TABLE `industries` ADD CONSTRAINT `industries_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `industries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
