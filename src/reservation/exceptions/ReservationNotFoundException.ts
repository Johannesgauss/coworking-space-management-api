import { NotFoundException } from '@nestjs/common';
export class ReservationCancelNotFoundException extends NotFoundException {
  constructor() {
    super('Reserva não encontrada.');
  }
}
