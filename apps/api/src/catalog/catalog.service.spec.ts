import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrisma = {
    vehicleBrand: {
      findMany: jest.fn(),
    },
    vehicleModel: {
      findMany: jest.fn(),
    },
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    delByPrefix: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBrands', () => {
    it('should return cached brands if available', async () => {
      const mockBrands = [{ id: '1', name: 'Fiat' }];
      mockRedis.get.mockResolvedValue(mockBrands);

      const result = await service.getBrands();

      expect(redis.get).toHaveBeenCalledWith('catalog:brands');
      expect(result).toEqual(mockBrands);
      expect(prisma.vehicleBrand.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from prisma and cache if not in redis', async () => {
      const mockBrands = [{ id: '1', name: 'Fiat' }];
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.vehicleBrand.findMany.mockResolvedValue(mockBrands);

      const result = await service.getBrands();

      expect(prisma.vehicleBrand.findMany).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith('catalog:brands', mockBrands, expect.any(Number));
      expect(result).toEqual(mockBrands);
    });
  });
});
