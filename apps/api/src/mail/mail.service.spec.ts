import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn(),
        },
      };
    }),
  };
});

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let mockSend: jest.Mock;

  beforeEach(async () => {
    mockSend = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: { send: mockSend }
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RESEND_API_KEY') return 'real_api_key_123';
              if (key === 'MAIL_FROM') return 'test@test.com';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should throw InternalServerErrorException with defaultErrorMessage when Resend returns an error object', async () => {
      mockSend.mockResolvedValue({ error: new Error('Resend error') });

      await expect(service.sendVerificationEmail('test@test.com', 'Test', '1234')).rejects.toThrow(
        new InternalServerErrorException('Falha ao enviar e-mail de verificação.')
      );
    });

    it('should re-throw InternalServerErrorException caught inside try catch', async () => {
      // By making Resend return an error, the try block throws an InternalServerErrorException
      // which is then caught and re-thrown by the catch block.
      mockSend.mockResolvedValue({ error: new Error('Resend error') });

      try {
        await service.sendVerificationEmail('test@test.com', 'Test', '1234');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Falha ao enviar e-mail de verificação.');
      }
    });

    it('should throw InternalServerErrorException with fallback message when a generic exception occurs inside try block', async () => {
      mockSend.mockRejectedValue(new Error('Unexpected network exception'));

      await expect(service.sendVerificationEmail('test@test.com', 'Test', '1234')).rejects.toThrow(
        new InternalServerErrorException('Falha no serviço de e-mail.')
      );
    });

    it('should return data when Resend call succeeds', async () => {
      mockSend.mockResolvedValue({ data: { id: 'real-id-123' }, error: null });

      const result = await service.sendVerificationEmail('test@test.com', 'Test', '1234');
      expect(result).toEqual({ id: 'real-id-123' });
    });
  });

  describe('sendEmail without RESEND_API_KEY', () => {
    let debugService: MailService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'RESEND_API_KEY') return null; // No API key
                if (key === 'MAIL_FROM') return 'test@test.com';
                return null;
              }),
            },
          },
        ],
      }).compile();

      debugService = module.get<MailService>(MailService);
    });

    it('should return mock data when Resend is not initialized', async () => {
      const result = await debugService.sendVerificationEmail('test@test.com', 'Test', '1234');
      expect(result).toEqual({ id: 'debug-id', mock: true });
    });
  });

  describe('other methods', () => {
    it('should send verification status email (approved)', async () => {
      mockSend.mockResolvedValue({ data: { id: 'real-id-123' }, error: null });
      const result = await service.sendVerificationStatusEmail('test@test.com', 'Store', 'APPROVED');
      expect(result).toEqual({ id: 'real-id-123' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Parabéns! Sua loja foi verificada no PECAÊ'
      }));
    });

    it('should send verification status email (rejected with notes)', async () => {
      mockSend.mockResolvedValue({ data: { id: 'real-id-123' }, error: null });
      const result = await service.sendVerificationStatusEmail('test@test.com', 'Store', 'REJECTED', 'Invalid docs');
      expect(result).toEqual({ id: 'real-id-123' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Atualização sobre a verificação da sua loja - PECAÊ',
        html: expect.stringContaining('Invalid docs')
      }));
    });

    it('should send password reset email', async () => {
      mockSend.mockResolvedValue({ data: { id: 'real-id-123' }, error: null });
      const result = await service.sendPasswordResetEmail('test@test.com', 'User', 'token-123');
      expect(result).toEqual({ id: 'real-id-123' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Recuperação de senha - PECAÊ',
        html: expect.stringContaining('token-123')
      }));
    });
  });
});
