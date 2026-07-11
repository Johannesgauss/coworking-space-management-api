import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserController } from './adminUser.controller';
import { UserService } from './user.service';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      promoteToAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call promoteToAdmin on promoteToAdmin', async () => {
    const userId = 'user-1';
    const expectedResponse = { message: 'Usuário promovido a administrador com sucesso' };
    userService.promoteToAdmin.mockResolvedValue(expectedResponse);

    const result = await controller.promoteToAdmin(userId);

    expect(userService.promoteToAdmin).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedResponse);
  });
});
