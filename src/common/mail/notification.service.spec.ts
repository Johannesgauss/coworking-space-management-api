import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('NotificationService', () => {
  let service: NotificationService;
  let mailer: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const mockMailer = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: MailerService,
          useValue: mockMailer,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    mailer = module.get(MailerService);

    process.env.FRONTEND_URL = 'http://frontend.local';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendRegistrationEmail', () => {
    it('should call sendMail with correct payload', async () => {
      await service.sendRegistrationEmail('token-123', 'test@example.com', 'Alice');

      expect(mailer.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Confirme seu registro',
        html: expect.stringContaining('http://frontend.local/auth/verify-email?token=token-123'),
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should call sendMail with correct payload', async () => {
      await service.sendResetPasswordEmail('token-456', 'test@example.com', 'Alice');

      expect(mailer.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Confirme seu registro',
        html: expect.stringContaining('http://frontend.local/auth/reset-password?token=token-456'),
      });
    });
  });
});
