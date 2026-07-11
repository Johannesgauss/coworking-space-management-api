import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { NotificationService } from 'src/common/mail/notification.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let mailer: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      emailVerification: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      passwordReset: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));

    const mockNotificationService = {
      sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
      sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    mailer = module.get<NotificationService>(NotificationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerAccount', () => {
    it('should register a new account', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-id' });

      const dto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'USER',
      };

      const result = await service.registerAccount(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.emailVerification.create).toHaveBeenCalled();
      expect(mailer.sendRegistrationEmail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Conta registrada com Sucesso. Verifique seu email.' });
    });

    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      const dto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'USER',
      };

      await expect(service.registerAccount(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyAccount', () => {
    it('should verify account if token is valid and not expired', async () => {
      const expiresAt = new Date(Date.now() + 100000);
      prisma.emailVerification.findUnique.mockResolvedValue({
        id: 'verification-id',
        userId: 'user-id',
        expiresAt,
      });

      const result = await service.verifyAccount('token');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { status: 'ACTIVE' },
      });
      expect(prisma.emailVerification.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Conta confirmada com sucesso! Siga para o Login' });
    });

    it('should throw BadRequestException if token not found', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue(null);

      await expect(service.verifyAccount('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should delete verification and throw BadRequestException if token is expired', async () => {
      const expiresAt = new Date(Date.now() - 100000);
      prisma.emailVerification.findUnique.mockResolvedValue({
        id: 'verification-id',
        userId: 'user-id',
        expiresAt,
      });

      await expect(service.verifyAccount('token')).rejects.toThrow(BadRequestException);
      expect(prisma.emailVerification.delete).toHaveBeenCalledWith({
        where: { id: 'verification-id' },
      });
    });
  });

  describe('login', () => {
    it('should log in and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'USER',
      });
      jwtService.signAsync.mockResolvedValue('token');

      const dto = { email: 'john@example.com', password: 'password' };
      const result = await service.login(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(argon2.verify).toHaveBeenCalledWith('hashed_password', 'password');
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const dto = { email: 'john@example.com', password: 'password' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'USER',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const dto = { email: 'john@example.com', password: 'wrong-password' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens if valid', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-id', jti: 'jti' });
      prisma.refreshToken.findUnique.mockResolvedValue({ token: 'hashed_refresh' });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id', role: 'USER' });
      jwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshToken('refresh-token');

      expect(result).toEqual({
        access_token: 'new-token',
        refresh_token: 'new-token',
      });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { jti: 'jti' } });
    });

    it('should throw UnauthorizedException on any error', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh tokens', async () => {
      await service.logout('user-id');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
    });
  });

  describe('forgotPassword', () => {
    it('should send reset password email if user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        name: 'John',
      });

      const result = await service.forgotPassword('john@example.com');

      expect(prisma.passwordReset.create).toHaveBeenCalled();
      expect(mailer.sendResetPasswordEmail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Se o email existir, enviaremos um link de recuperação' });
    });

    it('should not send email but return success message if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(prisma.passwordReset.create).not.toHaveBeenCalled();
      expect(mailer.sendResetPasswordEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Se o email existir, enviaremos um link de recuperação' });
    });
  });

  describe('changeForgottenPassword', () => {
    it('should change password if token is valid', async () => {
      const expiresAt = new Date(Date.now() + 100000);
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 'reset-id',
        userId: 'user-id',
        expiresAt,
      });

      const result = await service.changeForgottenPassword('token', 'new-password');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { password: 'hashed_password' },
      });
      expect(prisma.passwordReset.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });

    it('should throw BadRequestException if token not found', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue(null);

      await expect(service.changeForgottenPassword('token', 'pwd')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token expired', async () => {
      const expiresAt = new Date(Date.now() - 100000);
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 'reset-id',
        userId: 'user-id',
        expiresAt,
      });

      await expect(service.changeForgottenPassword('token', 'pwd')).rejects.toThrow(BadRequestException);
      expect(prisma.passwordReset.delete).toHaveBeenCalledWith({ where: { id: 'reset-id' } });
    });
  });

  describe('changePassword', () => {
    it('should change password for an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id' });

      const result = await service.changePassword('user-id', 'new-password');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { password: 'hashed_password' },
      });
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword('user-id', 'new-password')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account if password matches', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        password: 'hashed_password',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.deleteAccount('user-id', 'password');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { status: 'DELETED', email: 'deleted_user-id@...' },
      });
      expect(result).toEqual({ message: 'Conta deletada com sucesso' });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount('user-id', 'password')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        password: 'hashed_password',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.deleteAccount('user-id', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });
});
