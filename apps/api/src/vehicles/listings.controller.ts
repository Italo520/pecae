import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os anúncios ativos (Público para Compradores)' })
  async findAll(@Query('city') city?: string, @Query('state') state?: string) {
    return this.vehiclesService.findAllPublished({ city, state });
  }
}
