import { Processor, Process } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('seller-stats')
export class SellerStatsProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('update-seller-stats')
  async handle(job: Job<{ sellerProfileId: string }>) {
    const { sellerProfileId } = job.data;

    // 1. Calculate active listings (PUBLISHED)
    const activeListings = await this.prisma.listing.count({
      where: {
        sellerProfileId,
        status: 'PUBLISHED',
      },
    });

    // 2. Calculate total sold listings (SOLD)
    const totalSold = await this.prisma.listing.count({
      where: {
        sellerProfileId,
        status: 'SOLD',
      },
    });

    // 3. Calculate total listings
    const totalListings = await this.prisma.listing.count({
      where: {
        sellerProfileId,
      },
    });

    // 4. Update the seller stats
    // Note: avgResponseTimeMinutes logic should ideally parse chat messages
    // M03 specifies it, but since Chat module is not fully implemented, we'll keep it as is or omit it for now
    await this.prisma.sellerStats.update({
      where: { sellerProfileId },
      data: {
        activeListings,
        totalSold,
        totalListings,
      },
    });

    return {
      sellerProfileId,
      activeListings,
      totalSold,
      totalListings,
      status: 'updated',
    };
  }
}
