import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import {
  createReservationSchema,
  type CreateReservationDto,
} from './dto/create-reservation.dto';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ZodError } from 'zod';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  findAllUserReservations(@User('id') userId: string) {
    return this.reservationService.findUserReservations(userId);
  }

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @User('id') userId: string,
  ) {
    try {
      const validatedData = createReservationSchema.parse(createReservationDto);
      return await this.reservationService.create(validatedData, userId);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Dados de envio inválidos',
          errors: error.issues,
        });
      }

      throw error;
    }
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
    return this.reservationService.cancel(id, userId);
  }
}
