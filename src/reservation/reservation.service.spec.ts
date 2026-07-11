import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { ReservationCancelNotFoundException } from './exceptions/ReservationNotFoundException';
import { ReservationForbiddenException } from './exceptions/ReservationForbiddenException';
import { ReservationCancelNotAllowedException } from './exceptions/ReservationCancelNotAllowedException';

describe('ReservationService', () => {
  let service: ReservationService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      reservation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      roomId: 'e29a9971-df07-4e94-bb9f-5c91ffad1b8e',
      date: new Date('2026-07-10'),
      startTime: new Date('2026-07-10T10:00:00Z'),
      endTime: new Date('2026-07-10T11:00:00Z'),
    };

    it('should create reservation if no conflict exists', async () => {
      prisma.reservation.findFirst.mockResolvedValue(null);
      prisma.reservation.create.mockResolvedValue({ id: 'res-1', ...dto, userId: 'user-1', status: 'ACTIVE' });

      const result = await service.create(dto, 'user-1');

      expect(prisma.reservation.findFirst).toHaveBeenCalled();
      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          status: 'ACTIVE',
          userId: 'user-1',
        },
      });
      expect(result.id).toBe('res-1');
    });

    it('should throw ConflictException if conflicting reservation is found', async () => {
      prisma.reservation.findFirst.mockResolvedValue({ id: 'conflicting-1' });

      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return reservation for the owner', async () => {
      const res = { id: 'res-1', userId: 'user-1' };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });

      const result = await service.findOne('res-1', 'user-1');

      expect(result).toEqual(res);
    });

    it('should return reservation for an admin even if not owner', async () => {
      const res = { id: 'res-1', userId: 'user-2' };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });

      const result = await service.findOne('res-1', 'admin-1');

      expect(result).toEqual(res);
    });

    it('should throw ReservationCancelNotFoundException if reservation does not exist', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('res-1', 'user-1')).rejects.toThrow(ReservationCancelNotFoundException);
    });

    it('should throw ReservationForbiddenException if requester is not owner and not admin', async () => {
      const res = { id: 'res-1', userId: 'user-2' };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });

      await expect(service.findOne('res-1', 'user-1')).rejects.toThrow(ReservationForbiddenException);
    });
  });

  describe('cancel', () => {
    it('should cancel reservation if admin', async () => {
      const res = { id: 'res-1', userId: 'user-2', startTime: new Date() };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      prisma.reservation.update.mockResolvedValue({ ...res, status: 'CANCELED' });

      const result = await service.cancel('res-1', 'admin-1');

      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: { status: 'CANCELED' },
      });
      expect(result.status).toBe('CANCELED');
    });

    it('should cancel reservation if owner and time difference is greater than 24 hours', async () => {
      const tomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000);
      const res = { id: 'res-1', userId: 'user-1', startTime: tomorrow };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });
      prisma.reservation.update.mockResolvedValue({ ...res, status: 'CANCELED' });

      const result = await service.cancel('res-1', 'user-1');

      expect(result.status).toBe('CANCELED');
    });

    it('should throw ReservationCancelNotFoundException if reservation does not exist', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel('res-1', 'user-1')).rejects.toThrow(ReservationCancelNotFoundException);
    });

    it('should throw ReservationForbiddenException if requester is not owner and not admin', async () => {
      const res = { id: 'res-1', userId: 'user-2', startTime: new Date() };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });

      await expect(service.cancel('res-1', 'user-1')).rejects.toThrow(ReservationForbiddenException);
    });

    it('should throw ReservationCancelNotAllowedException if owner attempts to cancel less than 24 hours before startTime', async () => {
      const in2Hours = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const res = { id: 'res-1', userId: 'user-1', startTime: in2Hours };
      prisma.reservation.findUnique.mockResolvedValue(res);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });

      await expect(service.cancel('res-1', 'user-1')).rejects.toThrow(ReservationCancelNotAllowedException);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const list = [{ id: 'res-1' }];
      prisma.reservation.findMany.mockResolvedValue(list);

      const result = await service.findAll();

      expect(prisma.reservation.findMany).toHaveBeenCalled();
      expect(result).toEqual(list);
    });
  });

  describe('findUserReservations', () => {
    it('should return user reservations that are active and in the future', async () => {
      const list = [{ id: 'res-1' }];
      prisma.reservation.findMany.mockResolvedValue(list);

      const result = await service.findUserReservations('user-1');

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: 'ACTIVE',
          endTime: { gte: expect.any(Date) },
        },
        orderBy: { startTime: 'asc' },
      });
      expect(result).toEqual(list);
    });
  });

  describe('remove', () => {
    it('should call delete on prisma', async () => {
      prisma.reservation.delete.mockResolvedValue({ id: 'res-1' });

      const result = await service.remove('res-1');

      expect(prisma.reservation.delete).toHaveBeenCalledWith({ where: { id: 'res-1' } });
      expect(result).toEqual({ id: 'res-1' });
    });
  });

  describe('history', () => {
    it('should return all reservations for admin', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      const list = [{ id: 'res-1' }, { id: 'res-2' }];
      prisma.reservation.findMany.mockResolvedValue(list);

      const result = await service.history('admin-1');

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        orderBy: { startTime: 'desc' },
      });
      expect(result).toEqual(list);
    });

    it('should return only user reservations for user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });
      const list = [{ id: 'res-1' }];
      prisma.reservation.findMany.mockResolvedValue(list);

      const result = await service.history('user-1');

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { startTime: 'desc' },
      });
      expect(result).toEqual(list);
    });
  });
});
