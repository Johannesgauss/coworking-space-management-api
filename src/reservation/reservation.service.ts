import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationCancelNotAllowedException } from './exceptions/ReservationCancelNotAllowedException';
import { ReservationCancelNotFoundException } from './exceptions/ReservationNotFoundException';
import { ReservationForbiddenException } from './exceptions/ReservationForbiddenException';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { roomId, startTime, endTime } = createReservationDto;

    const conflictingReservation = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        status: 'ACTIVE',
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingReservation) {
      throw new ConflictException(
        'A sala já está reservada para este período.',
      );
    }

    return await this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        status: 'ACTIVE',
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new ReservationCancelNotFoundException();
    }

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (requestingUser?.role !== 'ADMIN' && reservation.userId !== userId) {
      throw new ReservationForbiddenException();
    }

    return reservation;
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new ReservationCancelNotFoundException();
    }

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (requestingUser?.role !== 'ADMIN') {
      if (reservation.userId !== userId) {
        throw new ReservationForbiddenException();
      }

      const now = new Date().getTime();
      const reservationTime = reservation.startTime.getTime();
      const diffMs = reservationTime - now;
      const twentyFourInMs = 24 * 60 * 60 * 1000;

      if (diffMs < twentyFourInMs) {
        throw new ReservationCancelNotAllowedException();
      }
    }

    return await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELED' },
    });
  }

  async findAll() {
    return await this.prisma.reservation.findMany();
  }

  async remove(id: string) {
    return await this.prisma.reservation.delete({
      where: { id }
    });
  }

  async history(userId: string) {
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (requestingUser?.role === 'ADMIN') {
      return await this.prisma.reservation.findMany({
        orderBy: { startTime: 'desc' },
      });
    }

    return await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
    });
  }
}
