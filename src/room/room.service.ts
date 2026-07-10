import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    return await this.prisma.room.create({
      data: createRoomDto,
    });
  }

  async findAll() {
    return await this.prisma.room.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.room.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateRoomDto: CreateRoomDto) {
    return await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.room.delete({
      where: { id },
    });
  }

  async findAvailableRooms(date: Date, startTime: Date, endTime: Date) {
    return await this.prisma.room.findMany({
      where: {
        NOT: {
          reservations: {
            some: {
              status: 'ACTIVE',
              OR: [
                {
                  startTime: { lt: endTime },
                  endTime: { gt: startTime },
                },
              ],
            },
          },
        },
      },
    });
  }
}
