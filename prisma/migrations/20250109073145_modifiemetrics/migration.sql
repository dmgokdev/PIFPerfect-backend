/*
  Warnings:

  - The `joinDate` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `roles` on the `metrics` table. All the data in the column will be lost.
  - Added the required column `role` to the `metrics` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `metrics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `metrics_roles_key` ON `metrics`;

-- AlterTable
ALTER TABLE `companies` DROP COLUMN `joinDate`,
    ADD COLUMN `joinDate` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- AlterTable
ALTER TABLE `metrics` DROP COLUMN `roles`,
    ADD COLUMN `operator` VARCHAR(191) NULL,
    ADD COLUMN `role` INTEGER NOT NULL,
    MODIFY `status` VARCHAR(100) NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
