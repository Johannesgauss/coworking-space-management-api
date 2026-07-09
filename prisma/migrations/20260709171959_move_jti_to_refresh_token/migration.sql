/*
  Warnings:

  - You are about to drop the column `jti` on the `PasswordReset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jti]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PasswordReset_jti_key";

-- AlterTable
ALTER TABLE "PasswordReset" DROP COLUMN "jti";

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "jti" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");
