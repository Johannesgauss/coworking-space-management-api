import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import argon2 from 'argon2'
import { nanoid } from "nanoid";
import { NotificationService } from 'src/common/mail/notification.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: NotificationService
    ) { }

    async registerAccount(dto: CreateAccountDto) {
        const isUserRegistered = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (isUserRegistered) {
            return { message: "Esse email já existe" }
        }

        const hashedPassword = await argon2.hash(dto.password);

        const registrationToken = nanoid(32)

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: dto.name,
                    lastName: dto.lastName,
                    email: dto.email,
                    password: hashedPassword
                }
            })
            
            this.mailer.sendRegistrationEmail(registrationToken, dto.email, dto.name)

            return newUser;
        })
    }
}

