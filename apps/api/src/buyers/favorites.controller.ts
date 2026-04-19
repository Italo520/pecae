import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('buyers/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':listingId')
  toggleFavorite(@Request() req, @Param('listingId') listingId: string) {
    return this.favoritesService.toggleFavorite(req.user.id, listingId);
  }

  @Get()
  getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.id);
  }
}
