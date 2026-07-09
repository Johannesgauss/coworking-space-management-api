import { ForbiddenException } from '@nestjs/common'
export class ReservationForbiddenException extends ForbiddenException {
  constructor() {
    super('Permissão de acesso à reserva negada.');
  }
}
