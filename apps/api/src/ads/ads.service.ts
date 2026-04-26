import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '../common/redis/redis.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { TrackAdDto } from './dto/track-ad.dto';
import { AdCampaignStatus } from '@prisma/client';

@Injectable()
export class AdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('ads') private readonly adsQueue: Queue,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });

    if (!listing) {
      throw new NotFoundException(`Anúncio com ID ${dto.listingId} não encontrado.`);
    }

    if (listing.status !== 'PUBLISHED') {
      throw new BadRequestException('Apenas anúncios publicados podem ser patrocinados.');
    }

    // Check if there's already an active campaign for this listing
    const existingCampaign = await this.prisma.adCampaign.findFirst({
      where: {
        listingId: dto.listingId,
        status: AdCampaignStatus.ACTIVE,
      },
    });

    if (existingCampaign) {
      throw new BadRequestException('Já existe uma campanha ativa para este anúncio.');
    }

    const campaign = await this.prisma.adCampaign.create({
      data: {
        listingId: dto.listingId,
        budget: dto.budget,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: AdCampaignStatus.ACTIVE,
      },
    });

    await this.prisma.listing.update({
      where: { id: dto.listingId },
      data: { isSponsoredActive: true },
    });

    return campaign;
  }

  async pauseCampaign(id: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada.`);
    }

    const updated = await this.prisma.adCampaign.update({
      where: { id },
      data: { status: AdCampaignStatus.PAUSED },
    });

    await this.prisma.listing.update({
      where: { id: campaign.listingId },
      data: { isSponsoredActive: false },
    });

    return updated;
  }

  async resumeCampaign(id: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada.`);
    }

    const updated = await this.prisma.adCampaign.update({
      where: { id },
      data: { status: AdCampaignStatus.ACTIVE },
    });

    await this.prisma.listing.update({
      where: { id: campaign.listingId },
      data: { isSponsoredActive: true },
    });

    return updated;
  }

  async cancelCampaign(id: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada.`);
    }

    const updated = await this.prisma.adCampaign.update({
      where: { id },
      data: { status: AdCampaignStatus.CANCELLED },
    });

    await this.prisma.listing.update({
      where: { id: campaign.listingId },
      data: { isSponsoredActive: false },
    });

    return updated;
  }

  async trackImpression(dto: TrackAdDto, ip: string) {
    try {
      await this.adsQueue.add(
        'track-impression',
        { ...dto, ip },
        { removeOnComplete: true }
      );
    } catch (error) {
      console.error('Failed to add track-impression job:', error);
    }
    return { success: true };
  }

  async trackClick(dto: TrackAdDto, ip: string) {
    try {
      await this.adsQueue.add(
        'track-click',
        { ...dto, ip },
        { removeOnComplete: true }
      );
    } catch (error) {
      console.error('Failed to add track-click job:', error);
    }
    return { success: true };
  }

  async checkInterstitialCapping(userId: string): Promise<{ allowed: boolean }> {
    const key = `admob:interstitial:${userId}`;
    const exists = await this.redis.get(key);

    if (exists) {
      return { allowed: false };
    }

    // Block for 30 minutes (1800 seconds)
    await this.redis.set(key, true, 1800);
    return { allowed: true };
  }

  async getSponsoredListings(limit = 2) {
    // Pacing Uniforme: Ordenar por menor número de impressões
    const campaigns = await this.prisma.adCampaign.findMany({
      where: {
        status: AdCampaignStatus.ACTIVE,
        listing: {
          status: 'PUBLISHED',
        },
      },
      orderBy: {
        impressions: 'asc',
      },
      take: limit,
      include: {
        listing: {
          include: {
            vehicle: {
              include: {
                photos: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
                version: {
                  include: {
                    model: {
                      include: {
                        brand: true,
                      },
                    },
                  },
                },
                yearFab: true,
              },
            },
            sellerProfile: true,
          },
        },
      },
    });

    return campaigns.map((c) => ({
      ...c.listing,
      campaignId: c.id,
      isSponsored: true,
    }));
  }

  async getAllCampaigns() {
    return this.prisma.adCampaign.findMany({
      include: {
        listing: {
          include: {
            vehicle: {
              include: {
                photos: true,
                version: {
                  include: {
                    model: {
                      include: {
                        brand: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }


}
