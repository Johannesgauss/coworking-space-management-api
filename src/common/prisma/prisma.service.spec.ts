import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../generated/prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $connect = mockConnect;
      $disconnect = mockDisconnect;
    },
  };
});

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    mockConnect.mockClear();
    mockDisconnect.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
