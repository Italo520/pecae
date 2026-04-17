import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UsersModule, PrismaModule, MailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
