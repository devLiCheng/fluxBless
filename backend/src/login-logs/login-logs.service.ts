import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginLogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, ip: string, userAgent: string) {
    const country = await this.getCountryFromIp(ip);
    return this.prisma.loginLog.create({
      data: {
        userId,
        ip,
        userAgent,
        country,
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          loginTime: 'desc',
        },
      }),
      this.prisma.loginLog.count(),
    ]);

    return { items, total };
  }

  private async getCountryFromIp(ip: string): Promise<string> {
    const cleanIp = ip.replace(/^::ffff:/, ''); // clean IPv4-mapped IPv6 addresses
    if (
      cleanIp === '127.0.0.1' ||
      cleanIp === '::1' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.') ||
      cleanIp.startsWith('172.16.') ||
      cleanIp.startsWith('localhost')
    ) {
      return '本地开发/局域网';
    }
    try {
      const res = await Promise.race([
        fetch(`http://ip-api.com/json/${cleanIp}`),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      ]);
      if (res && (res as any).ok) {
        const data = await (res as any).json();
        return data.country || '未知国家';
      }
    } catch (err: any) {
      console.warn('Geolocation lookup failed for IP:', cleanIp, err.message);
    }
    return '未知国家';
  }
}
