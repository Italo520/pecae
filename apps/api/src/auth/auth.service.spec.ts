import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../common/sms/sms.service';
import { UserType, UserStatus } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma: any = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
    },
    emailVerificationToken: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    }),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'secret';
      return null;
    }),
  };

  const mockSmsService = {
    sendOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SmsService, useValue: mockSmsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        verificationToken: 'valid-token',
        status: UserStatus.PENDING_VERIFICATION,
      };

      mockPrisma.emailVerificationToken.findFirst.mockResolvedValue({ id: 'token-1', userId: 'user-1' });
      mockPrisma.emailVerificationToken.update.mockResolvedValue({ id: 'token-1', usedAt: new Date() });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, status: UserStatus.ACTIVE });

      const result = await service.verifyEmail('valid-token');

      expect(result).toEqual({ message: 'E-mail verificado com sucesso! Sua conta está ativa.' });
    });

    it('should throw ConflictException for invalid token', async () => {
      mockPrisma.emailVerificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow();
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({
        message: 'Se o e-mail informado estiver em nossa base, você receberá instruções para redefinir sua senha.',
      });
      expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should generate token, save it, and send email if user exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordResetToken.create.mockResolvedValue({ id: 'token-id' });
      mockMailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await service.forgotPassword('test@example.com');

      expect(result).toEqual({
        message: 'Instruções de recuperação enviadas para o e-mail informado.',
      });

      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });

      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        expect.any(String),
      );
    });
  });
});
