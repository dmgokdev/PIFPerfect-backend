/*
  Warnings:

  - A unique constraint covering the columns `[userId,companyId]` on the table `users_companies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_companies_userId_companyId_key` ON `users_companies`(`userId`, `companyId`);
