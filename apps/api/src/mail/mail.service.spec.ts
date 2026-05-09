import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";
import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException, Logger } from "@nestjs/common";

// Mock the entire resend module
jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

describe("MailService", () => {
  let service: MailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Clear mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  describe("Initialization / Fallback", () => {
    it("should log a warning and use mock if RESEND_API_KEY is not configured", async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const loggerWarnSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // We need to re-initialize to trigger constructor logic
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<MailService>(MailService);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        "RESEND_API_KEY não configurada ou inválida. E-mails serão apenas logados no console.",
      );

      // Verify that sendVerificationEmail uses the debug fallback
      const loggerDebugSpy = jest
        .spyOn(Logger.prototype, "debug")
        .mockImplementation();
      const result = await service.sendVerificationEmail(
        "test@example.com",
        "Test User",
        "123456",
      );

      expect(result).toEqual({ id: "debug-id", mock: true });
      expect(loggerDebugSpy).toHaveBeenCalled();

      loggerWarnSpy.mockRestore();
      loggerDebugSpy.mockRestore();
    });

    it("should log a warning and use mock if RESEND_API_KEY is the dummy value", async () => {
      mockConfigService.get.mockReturnValue("re_123456789");
      const loggerWarnSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<MailService>(MailService);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        "RESEND_API_KEY não configurada ou inválida. E-mails serão apenas logados no console.",
      );

      const result = await service.sendVerificationEmail(
        "test@example.com",
        "Test User",
        "123456",
      );
      expect(result).toEqual({ id: "debug-id", mock: true });

      loggerWarnSpy.mockRestore();
    });
  });

  describe("Public Methods (with valid RESEND_API_KEY)", () => {
    let mockResendSend: jest.Mock;

    beforeEach(async () => {
      // Setup the config to return a valid API key and other variables
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "RESEND_API_KEY") return "valid-api-key";
        if (key === "MAIL_FROM") return "Test Sender <test@example.com>";
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        return null;
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<MailService>(MailService);

      // Access the mock `send` function through the service's instantiated `resend` property
      // Note: Because we used jest.mock('resend'), the constructor of Resend returned our mock implementation
      mockResendSend = (service as any).resend.emails.send;
      mockResendSend.mockResolvedValue({
        data: { id: "sent-id" },
        error: null,
      });
    });

    it("should send a verification email with correct payload", async () => {
      const email = "user@example.com";
      const name = "John Doe";
      const code = "789123";

      const result = await service.sendVerificationEmail(email, name, code);

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      const callArg = mockResendSend.mock.calls[0][0];

      expect(callArg.to).toEqual([email]);
      expect(callArg.from).toEqual("Test Sender <test@example.com>");
      expect(callArg.subject).toEqual("Seu código de acesso PECAÊ");
      expect(callArg.html).toContain(name);
      expect(callArg.html).toContain(code);

      expect(result).toEqual({ id: "sent-id" });
    });

    it("should send an approved verification status email", async () => {
      const email = "store@example.com";
      const storeName = "My Store";

      await service.sendVerificationStatusEmail(email, storeName, "APPROVED");

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      const callArg = mockResendSend.mock.calls[0][0];

      expect(callArg.subject).toEqual(
        "Parabéns! Sua loja foi verificada no PECAÊ",
      );
      expect(callArg.html).toContain("Selo Verificado");
      expect(callArg.html).toContain(storeName);
    });

    it("should send a rejected verification status email with notes", async () => {
      const email = "store@example.com";
      const storeName = "My Store";
      const notes = "Missing documents.";

      await service.sendVerificationStatusEmail(
        email,
        storeName,
        "REJECTED",
        notes,
      );

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      const callArg = mockResendSend.mock.calls[0][0];

      expect(callArg.subject).toEqual(
        "Atualização sobre a verificação da sua loja - PECAÊ",
      );
      expect(callArg.html).toContain("Infelizmente não pudemos aprovar");
      expect(callArg.html).toContain(notes);
    });

    it("should send a password reset email with correct reset link", async () => {
      const email = "user@example.com";
      const name = "Jane Doe";
      const token = "reset-token-123";

      await service.sendPasswordResetEmail(email, name, token);

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      const callArg = mockResendSend.mock.calls[0][0];

      expect(callArg.subject).toEqual("Recuperação de senha - PECAÊ");
      expect(callArg.html).toContain(
        "http://localhost:3000/reset-password?token=reset-token-123",
      );
      expect(callArg.html).toContain(name);
    });

    describe("Error Handling", () => {
      it("should throw InternalServerErrorException when Resend returns an error object", async () => {
        const errorMsg = "Failed to send from Resend";
        mockResendSend.mockResolvedValue({
          data: null,
          error: new Error(errorMsg),
        });

        const loggerErrorSpy = jest
          .spyOn(Logger.prototype, "error")
          .mockImplementation();

        await expect(
          service.sendVerificationEmail("test@example.com", "Test", "123"),
        ).rejects.toThrow(InternalServerErrorException);

        expect(loggerErrorSpy).toHaveBeenCalledWith(
          "Erro ao enviar e-mail via Resend:",
          expect.any(Error),
        );

        loggerErrorSpy.mockRestore();
      });

      it("should throw InternalServerErrorException when Resend throws an exception", async () => {
        mockResendSend.mockRejectedValue(new Error("Network error"));

        const loggerErrorSpy = jest
          .spyOn(Logger.prototype, "error")
          .mockImplementation();

        await expect(
          service.sendVerificationEmail("test@example.com", "Test", "123"),
        ).rejects.toThrow(InternalServerErrorException);

        expect(loggerErrorSpy).toHaveBeenCalledWith(
          "Exceção ao enviar e-mail:",
          expect.any(Error),
        );

        loggerErrorSpy.mockRestore();
      });
    });
  });
});
