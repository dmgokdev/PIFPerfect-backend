/*
  Warnings:

  - You are about to drop the column `establishedDate` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `tradeMark` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `companies` DROP COLUMN `establishedDate`,
    DROP COLUMN `licenseNumber`,
    DROP COLUMN `tradeMark`;

-- AlterTable
ALTER TABLE `daily_metrics` ADD COLUMN `productPrice` DOUBLE NULL;
