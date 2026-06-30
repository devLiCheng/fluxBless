-- CreateTable
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleZh` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summaryZh` TEXT NOT NULL,
    `summaryEn` TEXT NOT NULL,
    `contentZh` TEXT NOT NULL,
    `contentEn` TEXT NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `author` VARCHAR(191) NOT NULL DEFAULT 'FluxBless',
    `readTime` INTEGER NOT NULL DEFAULT 5,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
