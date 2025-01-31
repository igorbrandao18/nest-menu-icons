/*
  Warnings:

  - Added the required column `importPath` to the `menu_icons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_icons" ADD COLUMN     "importPath" TEXT NOT NULL;
