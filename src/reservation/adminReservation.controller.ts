import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Roles } from '../common/decorators/roles.decorator';

@Roles('ADMIN')
@Controller('admin/reservations')
export class AdminReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }
}
