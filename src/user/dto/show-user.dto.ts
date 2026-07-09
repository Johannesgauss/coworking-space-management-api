import { IsEmail, isString, IsString } from "class-validator";
import { Role } from "../../../generated/prisma/enums";

export class ShowUserDto {

    @IsString()
    name!: string;

    @IsString()
    lastName!: string;

    @IsEmail()
    email!: string;

    role!: Role;

}