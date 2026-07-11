import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Reservations')
@ApiBearerAuth()
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
