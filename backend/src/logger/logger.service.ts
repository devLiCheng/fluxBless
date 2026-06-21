import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoggerService {
  constructor(private prisma: PrismaService) {}

  async log(level: string, message: string, meta?: any) {
    return this.prisma.systemLog.create({
      data: {
        level,
        message,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  }

  async logClientEvent(data: {
    level: string;
    message: string;
    url?: string;
    userAgent?: string;
    stack?: string;
  }) {
    return this.prisma.systemLog.create({
      data: {
        level: data.level || 'info',
        message: data.message,
        meta: JSON.stringify({
          source: 'client',
          url: data.url,
          userAgent: data.userAgent,
          stack: data.stack,
        }),
      },
    });
  }

  async findAll(page = 1, limit = 50, level?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (level) where.level = level;

    const [items, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
