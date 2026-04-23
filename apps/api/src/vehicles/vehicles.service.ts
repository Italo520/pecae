import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateAvailablePartsDto } from './dto/update-available-parts.dto';
import { ListingStatus, VehicleStatus, PhotoType } from '@prisma/client';
import { StorageService } from '../common/storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  /**
   * Creates a new vehicle and its corresponding listing in an atomic transaction.
   * RN14: Both entities are created with PENDING status for moderation.
   */
  async create(sellerId: string, dto: CreateVehicleDto) {
    const { 
      versionId, 
      yearFabId, 
      availableParts, 
      title, 
      description, 
      ...vehicleData 
    } = dto;

    // Check for potential duplicity (RN10)
    const duplicate = await this.prisma.listing.findFirst({
      where: {
        sellerProfileId: sellerId,
        vehicle: {
          versionId,
          yearFabId,
        },
        status: { in: [ListingStatus.PENDING, ListingStatus.PUBLISHED] },
      },
      select: { id: true },
    });

    const isDuplicate = !!duplicate;
    const duplicateOfId = duplicate?.id || null;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Vehicle
      const vehicle = await tx.vehicle.create({
        data: {
          ...vehicleData,
          versionId,
          yearFabId,
          sellerId,
          availableParts,
          status: VehicleStatus.PENDING,
        },
      });

      // 2. Create Listing (RN14)
      const listing = await tx.listing.create({
        data: {
          sellerProfileId: sellerId,
          vehicleId: vehicle.id,
          title,
          description,
          status: ListingStatus.PENDING,
          isDuplicate,
          duplicateOfId,
        },
      });

      return { vehicle, listing, warnings: isDuplicate ? ['Anúncio similar já existente.'] : [] };
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        listing: true,
        photos: { orderBy: { order: 'asc' } },
        version: { include: { model: { include: { brand: true } } } },
        yearFab: true,
      },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    return vehicle;
  }

  /**
   * Updates vehicle and listing.
   * RN14: Every edit forces Listing back to PENDING.
   */
  async update(id: string, sellerId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (vehicle.sellerId !== sellerId) throw new ForbiddenException('Ação não permitida');

    const { title, description, ...vehicleData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updatedVehicle = await tx.vehicle.update({
        where: { id },
        data: { ...vehicleData, status: VehicleStatus.PENDING },
      });

      const updatedListing = await tx.listing.update({
        where: { vehicleId: id },
        data: { 
          title, 
          description, 
          status: ListingStatus.PENDING,
          publishedAt: null // RN14: Reset publication date
        },
      });

      return { vehicle: updatedVehicle, listing: updatedListing };
    });
  }

  /**
   * Quick update for available parts.
   * Does NOT trigger re-moderation.
   */
  async updateAvailableParts(id: string, sellerId: string, dto: UpdateAvailablePartsDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (vehicle.sellerId !== sellerId) throw new ForbiddenException('Ação não permitida');

    return this.prisma.vehicle.update({
      where: { id },
      data: { availableParts: dto.partIds },
    });
  }

  /**
   * Marks a vehicle as SOLD (RN06).
   */
  async markAsSold(id: string, sellerId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (vehicle.sellerId !== sellerId) throw new ForbiddenException('Ação não permitida');

    return this.prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id },
        data: { status: VehicleStatus.SOLD },
      });

      return tx.listing.update({
        where: { vehicleId: id },
        data: { 
          status: ListingStatus.SOLD,
          soldAt: new Date()
        },
      });
    });
  }

  async findBySeller(sellerId: string) {
    return this.prisma.vehicle.findMany({
      where: { sellerId },
      include: { listing: true, photos: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generates upload URLs for vehicle photos.
   */
  async generateUploadUrls(id: string, sellerId: string, count: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (vehicle.sellerId !== sellerId) throw new ForbiddenException('Ação não permitida');

    const uploadUrls = await Promise.all(
      Array.from({ length: count }, async (_, i) => {
        const path = `vehicles/${id}/photo_${Date.now()}_${i}`;
        const data = await this.storageService.createSignedUploadUrl('vehicle-photos', path);
        return {
          slotIndex: i,
          ...data,
        };
      }),
    );

    return uploadUrls;
  }

  /**
   * Confirms photo uploads and saves them to database.
   */
  async confirmPhotos(id: string, sellerId: string, photos: { url: string; type: PhotoType; order: number }[]) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (vehicle.sellerId !== sellerId) throw new ForbiddenException('Ação não permitida');

    return this.prisma.vehiclePhoto.createMany({
      data: photos.map((p) => ({
        vehicleId: id,
        url: p.url,
        type: p.type,
        order: p.order,
      })),
    });
  }
}
