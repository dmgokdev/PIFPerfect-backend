/*
  Warnings:

  - Added the required column `companyId` to the `projections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projections` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `projections` ADD CONSTRAINT `projections_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
