import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { BadRequestException } from '@nestjs/common';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: jest.Mocked<ReservationService>;

  beforeEach(async () => {
    const mockReservationService = {
      findUserReservations: jest.fn(),
      create: jest.fn(),
      history: jest.fn(),
      findOne: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUserReservations', () => {
    it('should return user reservations', async () => {
      const list = [{ id: 'res-1' }];
      service.findUserReservations.mockResolvedValue(list);

      const result = await controller.findAllUserReservations('user-1');

      expect(service.findUserReservations).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(list);
    });
  });

  describe('create', () => {
    it('should validate and create reservation', async () => {
      const dto = {
        roomId: 'e29a9971-df07-4e94-bb9f-5c91ffad1b8e',
        date: '2026-07-10',
        startTime: '2026-07-10T10:00:00Z',
        endTime: '2026-07-10T11:00:00Z',
      };
      const expectedResponse = { id: 'res-1', status: 'ACTIVE' };
      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(
        {
          roomId: 'e29a9971-df07-4e94-bb9f-5c91ffad1b8e',
          date: new Date('2026-07-10'),
          startTime: new Date('2026-07-10T10:00:00Z'),
          endTime: new Date('2026-07-10T11:00:00Z'),
        },
        'user-1',
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if schema validation fails', async () => {
      const invalidDto = {
        roomId: 'invalid-uuid',
        date: 'invalid-date',
        startTime: '2026-07-10T10:00:00Z',
        endTime: '2026-07-10T09:00:00Z',
      };

      await expect(controller.create(invalidDto as any, 'user-1')).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('history', () => {
    it('should return history list', async () => {
      const list = [{ id: 'res-1' }];
      service.history.mockResolvedValue(list);

      const result = await controller.history('user-1');

      expect(service.history).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return reservation', async () => {
      const res = { id: 'res-1' };
      service.findOne.mockResolvedValue(res);

      const result = await controller.findOne('res-1', 'user-1');

      expect(service.findOne).toHaveBeenCalledWith('res-1', 'user-1');
      expect(result).toEqual(res);
    });
  });

  describe('remove', () => {
    it('should cancel reservation', async () => {
      const res = { id: 'res-1', status: 'CANCELED' };
      service.cancel.mockResolvedValue(res);

      const result = await controller.remove('res-1', 'user-1');

      expect(service.cancel).toHaveBeenCalledWith('res-1', 'user-1');
      expect(result).toEqual(res);
    });
  });
});
