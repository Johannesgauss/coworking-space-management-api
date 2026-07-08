import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import argon2 from 'argon2'
import { nanoid } from "nanoid";
import { NotificationService } from 'src/common/mail/notification.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: NotificationService,
        private readonly jwtService: JwtService
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

            return {message: "Conta confirmada com sucesso! Siga para o Login"}
        })
    }

    async generateTokens(userId: string) {
        const refreshTokenId = nanoid();

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                iss: process.env.JWT_ISSUER,
                sub: userId
            }, {expiresIn: '15m'}),
            this.jwtService.signAsync(
                {
                    iss: process.env.JWT_ISSUER,
                    jti: refreshTokenId,
                    sub: userId
                }, {expiresIn: '7d'}
            )
        ])

        const hashedRefreshToken = await argon2.hash(refreshToken);

        await this.prisma.refreshToken.create({
            data: {
                userId: userId,
                id: refreshTokenId,
                token: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })

        return {accessToken, refreshToken}
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: {email: email}
        })

        if (!user) return {message: 'Credenciais inválidas'};

        const validatePassword = await argon2.verify(
            user.password,
            password
        )

        if (!validatePassword) return {message: "Credenciais inválidas"};

        const {accessToken, refreshToken} = await this.generateTokens(user.id)

        return {accessToken: accessToken, refreshToken: refreshToken}
    }
}

