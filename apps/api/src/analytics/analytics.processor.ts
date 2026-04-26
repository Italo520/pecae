import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('analytics-queue')
export class AnalyticsProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'register-view': {
        const { listingId, ipHash } = job.data;

        // Dedup: Verificar se já houve acesso desse IP no anúncio nas últimas 24h
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const existingView = await this.prisma.listingView.findFirst({
          where: {
            listingId,
            ipHash,
            viewedAt: { gte: twentyFourHoursAgo },
          },
        });

        if (existingView) {
          // Ignorado por dedup
          return { status: 'SKIPPED_DEDUP' };
        }

        // Criar registro da visualização
        await this.prisma.listingView.create({
          data: {
            listingId,
            ipHash,
          },
        });

        // Incrementar o contador estático na tabela de anúncios
        await this.prisma.listing.update({
          where: { id: listingId },
          data: {
            views: { increment: 1 },
          },
        });

        return { status: 'RECORDED' };
      }

      case 'recalc-metrics': {
        // 1. Buscar todos os anúncios
        const listings = await this.prisma.listing.findMany();

        for (const listing of listings) {
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

          // Contagem de visualizações agregadas por período
          const views7d = await this.prisma.listingView.count({
            where: { listingId: listing.id, viewedAt: { gte: sevenDaysAgo } },
          });

          const views30d = await this.prisma.listingView.count({
            where: { listingId: listing.id, viewedAt: { gte: thirtyDaysAgo } },
          });

          const views90d = await this.prisma.listingView.count({
            where: { listingId: listing.id, viewedAt: { gte: ninetyDaysAgo } },
          });

          // Chats iniciados (ChatRoom)
          const chatsInitiated30d = await this.prisma.chatRoom.count({
            where: { listingId: listing.id, createdAt: { gte: thirtyDaysAgo } },
          });

          // Taxa de conversão (Chats/Views)
          const conversionRate = views30d > 0 ? (chatsInitiated30d / views30d) * 100 : 0;

          // Upsert nos aggregates de ListingStats
          await this.prisma.listingStats.upsert({
            where: { listingId: listing.id },
            create: {
              listingId: listing.id,
              views7d,
              views30d,
              views90d,
              chatsInitiated30d,
              conversionRate,
              calculatedAt: now,
            },
            update: {
              views7d,
              views30d,
              views90d,
              chatsInitiated30d,
              conversionRate,
              calculatedAt: now,
            },
          });
        }

        // 2. Consolidar os SellerStats
        const sellers = await this.prisma.sellerProfile.findMany();

        for (const seller of sellers) {
          // Total de chats iniciados para todos os anúncios do vendedor
          const sellerListings = await this.prisma.listing.findMany({
            where: { sellerProfileId: seller.id },
            select: { id: true },
          });

          const listingIds = sellerListings.map(l => l.id);

          const totalChatsInitiated = await this.prisma.chatRoom.count({
            where: {
              listingId: { in: listingIds },
            },
          });

          await this.prisma.sellerStats.upsert({
            where: { sellerProfileId: seller.id },
            create: {
              sellerProfileId: seller.id,
              totalChatsInitiated,
            },
            update: {
              totalChatsInitiated,
            },
          });
        }

        return { status: 'RECALCULATED' };
      }

      default:
        console.warn(`Job desconhecido na fila analytics: ${job.name}`);
    }
  }
}
