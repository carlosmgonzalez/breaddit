/*
  Warnings:

  - You are about to drop the column `vote` on the `CommentVote` table. All the data in the column will be lost.
  - You are about to drop the column `vote` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `type` to the `CommentVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CommentVote` DROP COLUMN `vote`,
    ADD COLUMN `type` ENUM('UP', 'DOWN') NOT NULL;

-- AlterTable
ALTER TABLE `Vote` DROP COLUMN `vote`,
    ADD COLUMN `type` ENUM('UP', 'DOWN') NOT NULL;
