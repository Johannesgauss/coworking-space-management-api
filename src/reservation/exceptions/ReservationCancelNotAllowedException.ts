import { BadRequestException } from '@nestjs/common'
export class ReservationCancelNotAllowedException extends BadRequestException {
  constructor() {
    super('Cancelamento da reserva não pode ter menos de 24 horas.');
  }
}
