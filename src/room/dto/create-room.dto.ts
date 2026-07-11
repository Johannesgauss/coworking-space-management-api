import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateRoomDto {
  @IsString({ message: 'O nome da sala deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome da sala não pode estar vazio.' })
  name!: string;

  @IsInt({ message: 'A capacidade deve ser um número inteiro.' })
  @IsPositive({ message: 'A capacidade deve ser um número positivo.' })
  capacity!: number;

  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsNotEmpty({ message: 'A descrição não pode estar vazia.' })
  description!: string;
}
