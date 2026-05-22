import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('push-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Registra o Push Token do Expo para notificações' })
  async registerPushToken(
    @Request() req: any,
    @Body() body: { token: string; platform: 'ios' | 'android' | 'web' },
  ) {
    return this.userService.savePushToken(req.user.id, body.token, body.platform);
  }
}
