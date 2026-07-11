import { IsString, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsUUID('4', { message: 'O ID da sala deve ser um UUID válido.' })
  @IsNotEmpty()
  roomId!: string;

  @IsDateString({}, { message: 'A data deve ser uma string de data válida.' })
  @IsNotEmpty()
  date!: string;

  @IsDateString(
    {},
    { message: 'O horário de início deve ser uma string de data válida.' },
  )
  @IsNotEmpty()
  startTime!: string;

  @IsDateString(
    {},
    { message: 'O horário de término deve ser uma string de data válida.' },
  )
  @IsNotEmpty()
  endTime!: string;
}
