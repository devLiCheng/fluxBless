-- AlterTable
ALTER TABLE `products` ADD COLUMN `materialZh` VARCHAR(191) NULL,
                       ADD COLUMN `materialEn` VARCHAR(191) NULL,
                       ADD COLUMN `originZh` VARCHAR(191) NULL,
                       ADD COLUMN `originEn` VARCHAR(191) NULL,
                       ADD COLUMN `purificationZh` VARCHAR(191) NULL,
                       ADD COLUMN `purificationEn` VARCHAR(191) NULL,
                       ADD COLUMN `benefitsZh` TEXT NULL,
                       ADD COLUMN `benefitsEn` TEXT NULL,
                       ADD COLUMN `specWeight` VARCHAR(191) NULL,
                       ADD COLUMN `specBeadSize` VARCHAR(191) NULL,
                       ADD COLUMN `specBeadCount` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `login_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `loginTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `login_logs` ADD CONSTRAINT `login_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
