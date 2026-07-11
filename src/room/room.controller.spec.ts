import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomStatus } from '../../generated/prisma/enums';

describe('RoomController', () => {
  let controller: RoomController;
  let service: jest.Mocked<RoomService>;

  beforeEach(async () => {
    const mockRoomService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAvailableRooms: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      changeStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get(RoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should validate and create a room', async () => {
      const dto = { name: 'Sala 1', capacity: 10, description: 'Description 1' };
      const expectedResponse = { id: 'room-1', name: 'Sala 1', capacity: 10, description: 'Description 1', status: RoomStatus.ACTIVE };
      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const rooms = [{ id: 'room-1', name: 'Sala 1' }];
      service.findAll.mockResolvedValue(rooms);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(rooms);
    });
  });

  describe('findAvailable', () => {
    it('should query for available rooms', async () => {
      const rooms = [{ id: 'room-1', name: 'Sala 1' }];
      service.findAvailableRooms.mockResolvedValue(rooms);

      const result = await controller.findAvailable(
        '2026-07-10',
        '2026-07-10T10:00:00Z',
        '2026-07-10T11:00:00Z',
      );

      expect(service.findAvailableRooms).toHaveBeenCalledWith(
        new Date('2026-07-10'),
        new Date('2026-07-10T10:00:00Z'),
        new Date('2026-07-10T11:00:00Z'),
      );
      expect(result).toEqual(rooms);
    });
  });

  describe('findOne', () => {
    it('should find one room by id', async () => {
      const room = { id: 'room-1', name: 'Sala 1' };
      service.findOne.mockResolvedValue(room);

      const result = await controller.findOne('room-1');

      expect(service.findOne).toHaveBeenCalledWith('room-1');
      expect(result).toEqual(room);
    });
  });

  describe('update', () => {
    it('should validate and update a room', async () => {
      const dto = { name: 'Sala updated', capacity: 15, description: 'Description updated' };
      const expectedResponse = { id: 'room-1', name: 'Sala updated', capacity: 15, description: 'Description updated', status: RoomStatus.ACTIVE };
      service.update.mockResolvedValue(expectedResponse);

      const result = await controller.update('room-1', dto);

      expect(service.update).toHaveBeenCalledWith('room-1', dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('changeStatus', () => {
    it('should call changeStatus on service', async () => {
      const response = { id: 'room-1', status: RoomStatus.MAINTENANCE };
      service.changeStatus.mockResolvedValue(response);

      const result = await controller.changeStatus('room-1', { isActive: false });

      expect(service.changeStatus).toHaveBeenCalledWith('room-1', false);
      expect(result).toEqual(response);
    });
  });

  describe('remove', () => {
    it('should call remove on service', async () => {
      service.remove.mockResolvedValue({ id: 'room-1' });

      const result = await controller.remove('room-1');

      expect(service.remove).toHaveBeenCalledWith('room-1');
      expect(result).toEqual({ id: 'room-1' });
    });
  });
});
