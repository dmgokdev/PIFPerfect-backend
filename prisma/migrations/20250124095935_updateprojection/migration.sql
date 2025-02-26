/*
  Warnings:

  - You are about to drop the column `createdBy` on the `projections` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `projections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projections` DROP COLUMN `createdBy`,
    ADD COLUMN `endDate` DATE NOT NULL,
    ADD COLUMN `reason` VARCHAR(191) NULL;
