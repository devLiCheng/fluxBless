import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { categoryId, search, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
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
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
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
      },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
