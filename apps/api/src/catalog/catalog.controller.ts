import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('brands')
  @ApiOperation({ summary: 'List all vehicle brands' })
  @ApiResponse({ status: 200, description: 'Return all brands' })
  async getBrands() {
    return this.catalogService.getBrands();
  }

  @Get('brands/:brandId/models')
  @ApiOperation({ summary: 'List models for a specific brand' })
  @ApiResponse({ status: 200, description: 'Return all models for the brand' })
  async getModels(@Param('brandId') brandId: string) {
    return this.catalogService.getModels(brandId);
  }

  @Get('models/:modelId/versions')
  @ApiOperation({ summary: 'List versions for a specific model' })
  @ApiResponse({ status: 200, description: 'Return all versions for the model' })
  async getVersions(@Param('modelId') modelId: string) {
    return this.catalogService.getVersions(modelId);
  }

  @Get('versions/:versionId/years')
  @ApiOperation({ summary: 'List years for a specific version' })
  @ApiResponse({ status: 200, description: 'Return all years for the version' })
  async getYears(@Param('versionId') versionId: string) {
    return this.catalogService.getYears(versionId);
  }

  @Get('part-categories')
  @ApiOperation({ summary: 'List all part categories' })
  @ApiResponse({ status: 200, description: 'Return all part categories' })
  async getPartCategories() {
    return this.catalogService.getPartCategories();
  }
}
