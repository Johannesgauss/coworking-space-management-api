import { Test, TestingModule } from '@nestjs/testing';
import { AdminReservationController } from './adminReservation.controller';
import { ReservationService } from './reservation.service';

describe('AdminReservationController', () => {
  let controller: AdminReservationController;
  let service: jest.Mocked<ReservationService>;

  beforeEach(async () => {
    const mockReservationService = {
      findAll: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<AdminReservationController>(AdminReservationController);
    service = module.get(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call findAll on service', async () => {
      const list = [{ id: 'res-1' }];
      service.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(list);
    });
  });

  describe('remove', () => {
    it('should call remove on service', async () => {
      service.remove.mockResolvedValue({ id: 'res-1' });

      const result = await controller.remove('res-1');

      expect(service.remove).toHaveBeenCalledWith('res-1');
      expect(result).toEqual({ id: 'res-1' });
    });
  });
});
