import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { RoomStatus } from '../../generated/prisma/enums';

describe('RoomService', () => {
  let service: RoomService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      room: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a room', async () => {
      const dto = { name: 'Sala 1', capacity: 10, status: RoomStatus.ACTIVE };
      const expectedResult = { id: 'room-1', ...dto };
      prisma.room.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);

      expect(prisma.room.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const rooms = [{ id: 'room-1', name: 'Sala 1' }];
      prisma.room.findMany.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(prisma.room.findMany).toHaveBeenCalled();
      expect(result).toEqual(rooms);
    });
  });

  describe('findOne', () => {
    it('should return a room if found', async () => {
      const room = { id: 'room-1', name: 'Sala 1' };
      prisma.room.findUnique.mockResolvedValue(room);

      const result = await service.findOne('room-1');

      expect(prisma.room.findUnique).toHaveBeenCalledWith({ where: { id: 'room-1' } });
      expect(result).toEqual(room);
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const dto = { name: 'Sala updated', capacity: 12, status: RoomStatus.ACTIVE };
      const expectedResult = { id: 'room-1', ...dto };
      prisma.room.update.mockResolvedValue(expectedResult);

      const result = await service.update('room-1', dto);

      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changeStatus', () => {
    it('should change status to ACTIVE when isActive is true', async () => {
      prisma.room.findUnique.mockResolvedValue({ id: 'room-1', status: RoomStatus.MAINTENANCE });
      prisma.room.update.mockResolvedValue({ id: 'room-1', status: RoomStatus.ACTIVE });

      const result = await service.changeStatus('room-1', true);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({ where: { id: 'room-1' } });
      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: RoomStatus.ACTIVE },
      });
      expect(result.status).toEqual(RoomStatus.ACTIVE);
    });

    it('should change status to MAINTENANCE when isActive is false', async () => {
      prisma.room.findUnique.mockResolvedValue({ id: 'room-1', status: RoomStatus.ACTIVE });
      prisma.room.update.mockResolvedValue({ id: 'room-1', status: RoomStatus.MAINTENANCE });

      const result = await service.changeStatus('room-1', false);

      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: RoomStatus.MAINTENANCE },
      });
      expect(result.status).toEqual(RoomStatus.MAINTENANCE);
    });

    it('should throw NotFoundException if room is not found', async () => {
      prisma.room.findUnique.mockResolvedValue(null);

      await expect(service.changeStatus('nonexistent', true)).rejects.toThrow(NotFoundException);
      expect(prisma.room.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      prisma.room.delete.mockResolvedValue({ id: 'room-1' });

      const result = await service.remove('room-1');

      expect(prisma.room.delete).toHaveBeenCalledWith({ where: { id: 'room-1' } });
      expect(result).toEqual({ id: 'room-1' });
    });
  });

  describe('findAvailableRooms', () => {
    it('should search for available rooms', async () => {
      const rooms = [{ id: 'room-1' }];
      prisma.room.findMany.mockResolvedValue(rooms);

      const date = new Date('2026-07-10');
      const start = new Date('2026-07-10T10:00:00Z');
      const end = new Date('2026-07-10T11:00:00Z');

      const result = await service.findAvailableRooms(date, start, end);

      expect(prisma.room.findMany).toHaveBeenCalled();
      expect(result).toEqual(rooms);
    });
  });
});
