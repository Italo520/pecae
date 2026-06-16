import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { BannersService } from './banners.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  async getActiveBanners(@Query('position') position?: string) {
    return this.bannersService.getActiveBanners(position);
  }

  @Public()
  @Post(':id/click')
  async trackClick(@Param('id') id: string) {
    return this.bannersService.trackClick(id);
  }
}
