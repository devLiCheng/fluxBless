import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
    // Fetch all products and validate
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    // Check stock and calculate total
    let totalAmount = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.nameEn}`);
      }
      const lineTotal = Number(product.price) * item.quantity;
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Validate Coupon if provided
    let couponDiscount = 0;
    let userCouponRecord: any = null;
    if (dto.couponId) {
      userCouponRecord = await this.prisma.userCoupon.findFirst({
        where: {
          id: dto.couponId,
          userId,
        },
        include: { coupon: true },
      });

      if (!userCouponRecord) {
        throw new BadRequestException('Coupon not found or does not belong to you');
      }
      if (userCouponRecord.isUsed) {
        throw new BadRequestException('This coupon has already been used');
      }
      if (!userCouponRecord.coupon.isActive) {
        throw new BadRequestException('This coupon campaign is no longer active');
      }
      if (new Date() > new Date(userCouponRecord.coupon.expiresAt)) {
        throw new BadRequestException('This coupon has expired');
      }
      if (totalAmount < Number(userCouponRecord.coupon.minOrderAmount)) {
        throw new BadRequestException(
          `Order total does not meet the minimum purchase requirement of $${userCouponRecord.coupon.minOrderAmount} for this coupon`
        );
      }

      // Calculate final discount amount (cannot exceed subtotal)
      couponDiscount = Math.min(totalAmount, Number(userCouponRecord.coupon.discountAmount));
      totalAmount -= couponDiscount;
    }

    // Create order and update stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Mark UserCoupon as used
      if (dto.couponId) {
        await tx.userCoupon.update({
          where: { id: dto.couponId },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });
      }

      // Create order
      return tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'pending',
          paymentMethod: dto.paymentMethod,
          shippingAddress: dto.shippingAddress,
          contactPhone: dto.contactPhone,
          contactEmail: dto.contactEmail,
          couponId: dto.couponId ? userCouponRecord.couponId : undefined,
          couponDiscount: dto.couponId ? couponDiscount : undefined,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: { include: { product: true } },
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    });

    return order;
  }

  async findAllByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, email: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    const order = await this.prisma.order.findFirst({
      where: { paymentId },
    });
    if (!order) return null;

    return this.prisma.order.update({
      where: { id: order.id },
      data: { status },
    });
  }
}
