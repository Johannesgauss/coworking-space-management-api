import {IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator"
import { Roles } from "../types/roles.enum";

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsEnum(Roles, {message: "Precisa escolher um papel válido"})
    @IsNotEmpty()
    role!: Roles;

}