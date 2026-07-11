import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      registerAccount: jest.fn(),
      verifyAccount: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      changeForgottenPassword: jest.fn(),
      changePassword: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call registerAccount on register', async () => {
    const dto: CreateAccountDto = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'USER',
    };
    const expectedResult = { message: 'Conta registrada com Sucesso' };
    authService.registerAccount.mockResolvedValue(expectedResult);

    const result = await controller.register(dto);

    expect(authService.registerAccount).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  it('should call verifyAccount on verifyAccount', async () => {
    const token = 'some-token';
    const expectedResult = { message: 'Conta confirmada com sucesso' };
    authService.verifyAccount.mockResolvedValue(expectedResult);

    const result = await controller.verifyAccount(token);

    expect(authService.verifyAccount).toHaveBeenCalledWith(token);
    expect(result).toEqual(expectedResult);
  });

  it('should call login on login', async () => {
    const dto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };
    const expectedResult = { accessToken: 'access', refreshToken: 'refresh' };
    authService.login.mockResolvedValue(expectedResult);

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  it('should call logout on logout', async () => {
    const userId = 'user-id';
    authService.logout.mockResolvedValue(undefined);

    await controller.logout(userId);

    expect(authService.logout).toHaveBeenCalledWith(userId);
  });

  it('should call forgotPassword on requestForgotPassword', async () => {
    const email = 'john@example.com';
    const expectedResult = { message: 'Recuperação enviada' };
    authService.forgotPassword.mockResolvedValue(expectedResult);

    const result = await controller.requestForgotPassword(email);

    expect(authService.forgotPassword).toHaveBeenCalledWith(email);
    expect(result).toEqual(expectedResult);
  });

  it('should call changeForgottenPassword on resetForgottenPassword', async () => {
    const token = 'token';
    const password = 'new-password';
    const expectedResult = { message: 'Senha alterada' };
    authService.changeForgottenPassword.mockResolvedValue(expectedResult);

    const result = await controller.resetForgottenPassword(token, password);

    expect(authService.changeForgottenPassword).toHaveBeenCalledWith(token, password);
    expect(result).toEqual(expectedResult);
  });

  it('should call changePassword on changePassword', async () => {
    const userId = 'user-id';
    const password = 'new-password';
    const expectedResult = { message: 'Senha alterada' };
    authService.changePassword.mockResolvedValue(expectedResult);

    const result = await controller.changePassword(userId, password);

    expect(authService.changePassword).toHaveBeenCalledWith(userId, password);
    expect(result).toEqual(expectedResult);
  });

  it('should call deleteAccount on deleteAccount', async () => {
    const userId = 'user-id';
    const password = 'password123';
    const expectedResult = { message: 'Deletado' };
    authService.deleteAccount.mockResolvedValue(expectedResult);

    const result = await controller.deleteAccount(userId, password);

    expect(authService.deleteAccount).toHaveBeenCalledWith(userId, password);
    expect(result).toEqual(expectedResult);
  });
});
