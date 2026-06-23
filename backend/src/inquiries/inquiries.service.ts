import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInquiryDto, userId?: number) {
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    return this.prisma.inquiry.create({
      data: {
        name: dto.name,
        contactInfo: dto.contactInfo,
        message: dto.message,
        productId: dto.productId,
        userId: userId || null,
      },
      include: {
        product: {
          select: {
            id: true,
            nameZh: true,
            nameEn: true,
          },
        },
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            select: {
              id: true,
              nameZh: true,
              nameEn: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async updateStatus(id: number, status: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return this.prisma.inquiry.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return this.prisma.inquiry.delete({
      where: { id },
    });
  }
}
