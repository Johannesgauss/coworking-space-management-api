import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let superCanActivateSpy: jest.SpyInstance;

  beforeEach(async () => {
    superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockImplementation(() => true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    superCanActivateSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if route is public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalled();
    expect(superCanActivateSpy).not.toHaveBeenCalled();
  });

  it('should call super.canActivate if route is not public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalled();
    expect(superCanActivateSpy).toHaveBeenCalledWith(context);
  });
});
