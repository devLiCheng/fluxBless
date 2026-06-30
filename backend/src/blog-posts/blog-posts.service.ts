import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto, BlogPostQueryDto } from './dto/blog-post.dto';

@Injectable()
export class BlogPostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BlogPostQueryDto) {
    const { search, page = 1, limit = 10, isAdmin } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isAdmin !== 'true') {
      where.published = true;
    }

    if (search) {
      where.OR = [
        { titleZh: { contains: search } },
        { titleEn: { contains: search } },
        { summaryZh: { contains: search } },
        { summaryEn: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findOneBySlug(slug: string, isAdmin = false) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    if (!isAdmin && !post.published) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    // Check if slug is unique
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.blogPost.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateBlogPostDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }
}
