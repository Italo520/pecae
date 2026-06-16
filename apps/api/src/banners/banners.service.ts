import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getActiveBanners(position?: string) {
    const cacheKey = `banners:active${position ? `:${position}` : ''}`;
    
    // Try cache first
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    
    const banners = await this.prisma.banner.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
        ...(position ? { position } : {})
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Record impressions
    if (banners.length > 0) {
      const bannerIds = banners.map(b => b.id);
      // Run async to not block the request
      this.prisma.banner.updateMany({
        where: { id: { in: bannerIds } },
        data: { impressions: { increment: 1 } }
      }).catch(err => console.error('Error recording banner impressions:', err));
    }

    // Cache for 5 minutes
    await this.redis.set(cacheKey, banners, 300);

    return banners;
  }

  async trackClick(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });

    return { success: true };
  }
}
