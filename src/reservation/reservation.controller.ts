import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { createReservationSchema, type CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto, @User('id') userId: string) {
    const validatedData = createReservationSchema.parse(createReservationDto);
    return this.reservationService.create(validatedData, userId);
  }

  @Get('history')
  history(@User('id') userId: string) {
    return this.reservationService.history(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId: string) {
    return this.reservationService.findOne(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') userId: string) {
    return this.reservationService.remove(id, userId);
  }
}
