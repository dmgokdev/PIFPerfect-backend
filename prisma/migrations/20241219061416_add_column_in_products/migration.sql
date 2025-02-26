/*
  Warnings:

  - You are about to alter the column `productName` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    MODIFY `productName` VARCHAR(191) NOT NULL,
    MODIFY `defaultCashValue` FLOAT NULL;
