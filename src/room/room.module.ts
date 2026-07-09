import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [PrismaModule]
})
export class RoomModule {}
