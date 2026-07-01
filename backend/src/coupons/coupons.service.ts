import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // --- Admin API ---

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountAmount: dto.discountAmount,
        minOrderAmount: dto.minOrderAmount || 0.00,
        expiresAt: new Date(dto.expiresAt),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { userCoupons: true },
          },
        },
      }),
      this.prisma.coupon.count(),
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
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: number, dto: UpdateCouponDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.code) data.code = dto.code.toUpperCase();
    if (dto.discountAmount !== undefined) data.discountAmount = dto.discountAmount;
    if (dto.minOrderAmount !== undefined) data.minOrderAmount = dto.minOrderAmount;
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  // --- Public / Storefront API ---

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon campaign is currently inactive');
    }
    if (new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Coupon has expired');
    }
    return coupon;
  }

  // --- User claimed coupons ---

  async claim(userId: number, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon campaign is currently not active');
    }
    if (new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('This coupon has already expired');
    }

    // Check if duplicate claim
    const alreadyClaimed = await this.prisma.userCoupon.findFirst({
      where: { userId, couponId: coupon.id },
    });

    if (alreadyClaimed) {
      throw new BadRequestException('You have already claimed this coupon');
    }

    return this.prisma.userCoupon.create({
      data: {
        userId,
        couponId: coupon.id,
      },
      include: {
        coupon: true,
      },
    });
  }

  async findMyCoupons(userId: number) {
    const userCoupons = await this.prisma.userCoupon.findMany({
      where: { userId },
      include: {
        coupon: true,
      },
      orderBy: { claimedAt: 'desc' },
    });

    // Map coupons with virtual status labels for frontend convenience
    return userCoupons.map((uc) => {
      let status = 'available';
      if (uc.isUsed) {
        status = 'used';
      } else if (new Date() > new Date(uc.coupon.expiresAt)) {
        status = 'expired';
      }

      return {
        id: uc.id,
        couponId: uc.couponId,
        code: uc.coupon.code,
        discountAmount: uc.coupon.discountAmount,
        minOrderAmount: uc.coupon.minOrderAmount,
        expiresAt: uc.coupon.expiresAt,
        isUsed: uc.isUsed,
        usedAt: uc.usedAt,
        claimedAt: uc.claimedAt,
        status,
      };
    });
  }
}
