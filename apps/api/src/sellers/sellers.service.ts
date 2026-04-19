import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, dto: CreateSellerProfileDto) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('User already has a seller profile');
    }

    // Using transaction to create profile and stats together
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.sellerProfile.create({
        data: {
          ...dto,
          userId,
          openHours: dto.openHours || undefined, // Prisma requires undefined for JSON if not provided
        },
      });

      await tx.sellerStats.create({
        data: {
          sellerProfileId: profile.id,
        },
      });

      return profile;
    });
  }

  async update(userId: string, dto: UpdateSellerProfileDto) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        ...dto,
        openHours: dto.openHours || undefined,
      },
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        stats: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile;
  }

  async findPublicProfile(id: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        stats: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    // Omit sensitive data
    // We only expose city/state, not the full address or exact coordinates
    const { userId, cnpj, address, lat, lng, whatsapp, phone, ...publicData } = profile;

    return {
      ...publicData,
      whatsapp: profile.showWhatsapp ? whatsapp : undefined,
      phone: profile.showWhatsapp ? phone : undefined,
      stats: profile.stats ? {
        activeListings: profile.stats.activeListings,
        avgResponseTimeMinutes: profile.stats.avgResponseTimeMinutes,
      } : undefined,
    };
  }

  async getStats(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        stats: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile.stats;
  }

  async generateLogoUploadUrl(userId: string, filename: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const extension = filename.split('.').pop();
    const path = `sellers/${userId}/logo-${Date.now()}.${extension}`;
    
    const data = await this.storageService.createSignedUploadUrl('seller-logos', path);

    return {
      uploadUrl: data.uploadUrl,
      token: data.token,
      path: data.path,
      publicUrl: data.publicUrl,
    };
  }

  async confirmLogoUpload(userId: string, publicUrl: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    // Optional: add logic to delete old logo file if needed

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: { logo: publicUrl },
    });
  }
}
