import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private formatProductStats(product: any) {
    const reviews = product.reviews || [];
    const actualCount = reviews.length;
    const actualAvg = actualCount > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / actualCount 
      : 5.0;

    const { reviews: _, ...rest } = product;

    return {
      ...rest,
      rating: product.ratingOverride !== null && product.ratingOverride !== undefined 
        ? parseFloat(String(product.ratingOverride)) 
        : parseFloat(actualAvg.toFixed(1)),
      reviewCount: product.salesOverride !== null && product.salesOverride !== undefined 
        ? product.salesOverride 
        : actualCount,
    };
  }

  async findAll(query: ProductQueryDto) {
    const { categoryId, search, page = 1, limit = 12, isAdmin } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isAdmin !== 'true') {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { nameZh: { contains: search } },
        { nameEn: { contains: search } },
        { descriptionZh: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { 
          category: true,
          reviews: {
            select: { rating: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const itemsWithStats = items.map(p => this.formatProductStats(p));

    return {
      items: itemsWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, isAdmin = false) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        reviews: {
          select: { rating: true }
        }
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (!isAdmin && product.stock <= 0) {
      throw new NotFoundException('Product not found');
    }
    return this.formatProductStats(product);
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        nameZh: dto.nameZh,
        nameEn: dto.nameEn,
        descriptionZh: dto.descriptionZh,
        descriptionEn: dto.descriptionEn,
        price: dto.price,
        stock: dto.stock,
        images: dto.images,
        categoryId: dto.categoryId,
        materialZh: dto.materialZh,
        materialEn: dto.materialEn,
        originZh: dto.originZh,
        originEn: dto.originEn,
        purificationZh: dto.purificationZh,
        purificationEn: dto.purificationEn,
        benefitsZh: dto.benefitsZh,
        benefitsEn: dto.benefitsEn,
        specWeight: dto.specWeight,
        specBeadSize: dto.specBeadSize,
        specBeadCount: dto.specBeadCount,
        specWristSizeZh: dto.specWristSizeZh,
        specWristSizeEn: dto.specWristSizeEn,
        sizingDescZh: dto.sizingDescZh,
        sizingDescEn: dto.sizingDescEn,
        purchaseUrl: dto.purchaseUrl,
        ratingOverride: dto.ratingOverride,
        salesOverride: dto.salesOverride,
      },
    });
    return this.findOne(product.id, true);
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id, true);
    await this.prisma.product.update({
      where: { id },
      data: dto as any,
    });
    return this.findOne(id, true);
  }

  async remove(id: number) {
    await this.findOne(id, true);
    return this.prisma.product.delete({ where: { id } });
  }
}
