import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from 'generated/prisma/client';

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

  async changeStatus(id: string, isActive: boolean) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    const newStatus = isActive ? RoomStatus.ACTIVE : RoomStatus.MAINTENANCE;

    return this.prisma.room.update({
      where: { id },
      data: { status: newStatus },
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
