import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { AdminReservationController } from './adminReservation.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationController, AdminReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
