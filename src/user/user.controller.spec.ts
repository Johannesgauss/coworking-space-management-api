import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      getMe: jest.fn(),
      updateUserData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getMe on getMe', async () => {
    const userId = 'user-1';
    const expectedUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER',
    };
    userService.getMe.mockResolvedValue(expectedUser);

    const result = await controller.getMe(userId);

    expect(userService.getMe).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedUser);
  });

  it('should call updateUserData on updatePersonalUserData', async () => {
    const userId = 'user-1';
    const dto: UpdateUserDto = {
      name: 'Jane',
      lastName: 'Doe',
    };
    const expectedResponse = { message: 'Dados atualizados com sucesso' };
    userService.updateUserData.mockResolvedValue(expectedResponse);

    const result = await controller.updatePersonalUserData(userId, dto);

    expect(userService.updateUserData).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual(expectedResponse);
  });
});
