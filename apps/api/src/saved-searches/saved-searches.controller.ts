import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto/saved-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('buyers/saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createSavedSearchDto: CreateSavedSearchDto) {
    return this.savedSearchesService.create(userId, createSavedSearchDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.savedSearchesService.findAll(userId);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.savedSearchesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateSavedSearchDto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.update(id, userId, updateSavedSearchDto);
  }

  @Patch(':id/alert')
  toggleAlert(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body('alertActive') alertActive: boolean,
  ) {
    return this.savedSearchesService.update(id, userId, { alertActive });
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.savedSearchesService.remove(id, userId);
  }
}
