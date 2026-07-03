import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import argon2 from 'argon2'
import {nanoid} from "nanoid";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async registerAccount(dto: CreateAccountDto){
        const isUserRegistered = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (isUserRegistered) {
            return {message: "Esse email já existe"}
        }

        const hashedPassword = await argon2.hash(dto.password);

        const registrationToken = nanoid(32)

        const newUser = await this.prisma.user.create({
            data: {
                name: dto.name,
                lastName: dto.lastName,
                email: dto.email,
                password: hashedPassword
            }
        })

    }
}

