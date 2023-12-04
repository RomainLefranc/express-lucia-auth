/*
  Warnings:

  - You are about to drop the column `hashed_password` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `verification_token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "hashed_password",
ALTER COLUMN "expires" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verification_token";
