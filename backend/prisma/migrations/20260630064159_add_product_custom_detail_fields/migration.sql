-- AlterTable
ALTER TABLE `products` ADD COLUMN `purchaseUrl` TEXT NULL,
    ADD COLUMN `sizingDescEn` TEXT NULL,
    ADD COLUMN `sizingDescZh` TEXT NULL,
    ADD COLUMN `specWristSizeEn` VARCHAR(191) NULL,
    ADD COLUMN `specWristSizeZh` VARCHAR(191) NULL;
