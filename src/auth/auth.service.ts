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

        return await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: dto.name,
                    lastName: dto.lastName,
                    email: dto.email,
                    password: hashedPassword
                }
            })

            await tx.emailVerification.create({
                data: {
                    userId: newUser.id,
                    token: registrationToken,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
                }
            })

            this.mailer.sendRegistrationEmail(registrationToken, dto.email, dto.name)

            return {message: "Conta registrada com Sucesso. Verifique seu email."};
        })
    }

    async verifyAccount(token: string) {
        const userEmailRegistration = await this.prisma.emailVerification.findUnique({
            where: {
                token: token
            }
        })

        if (!userEmailRegistration || userEmailRegistration.expiresAt < new Date()) return { message: 'Inválido ou Token expirado' };



        return await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: userEmailRegistration.userId
                },
                data: {
                    status: 'ACTIVE'
                }
            })
            
            await tx.emailVerification.delete({
                where: {
                    token: token
                }
            })

            return {message: "Conta confirmada com sucesso! Siga para o Login1"}
        })
    }
}

