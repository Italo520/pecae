import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto, ip: string, userAgent: string) {
    const { email, password, name, type } = registerDto;

    // 1. Check if email already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('O e-mail informado já está em uso.');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      // 3. Create user and register terms acceptance in a transaction
      const { user, verificationToken } = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            type,
            status: UserStatus.PENDING_VERIFICATION,
          },
        });

        await tx.termsAcceptance.create({
          data: {
            userId: newUser.id,
            version: '1.0.0', // TODO: Get from config/env
            ip,
            userAgent,
          },
        });

        // Generate Verification Token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await tx.emailVerificationToken.create({
          data: {
            userId: newUser.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        return { user: newUser, verificationToken: rawToken };
      });

      // 4. Dispatch verification email (fire and forget for better response time)
      this.mailService.sendVerificationEmail(user.email, user.name, verificationToken)
        .catch(err => console.error('Delayed Error sending email:', err));

      return {
        message:
          'Cadastro realizado com sucesso. Verifique seu e-mail para ativar sua conta.',
      };
    } catch (error) {
      console.error('Registration Error:', error);
      throw new InternalServerErrorException(
        'Erro ao processar o cadastro. Tente novamente mais tarde.',
      );
    }
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new ConflictException(
        'Token de verificação inválido, já utilizado ou expirado.',
      );
    }

    try {
      await this.prisma.$transaction([
        // 1. Mark token as used
        this.prisma.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: { usedAt: new Date() },
        }),
        // 2. Activate user
        this.prisma.user.update({
          where: { id: verificationToken.userId },
          data: { status: UserStatus.ACTIVE },
        }),
      ]);

      return { message: 'E-mail verificado com sucesso! Sua conta está ativa.' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao verificar e-mail. Tente novamente mais tarde.',
      );
    }
  }
}
