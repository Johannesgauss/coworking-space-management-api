import {
    BadRequestException,
    ConflictException,
    HttpException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import argon2 from 'argon2'
import { nanoid } from "nanoid";
import { NotificationService } from 'src/common/mail/notification.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { createHash } from 'node:crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: NotificationService,
        private readonly jwtService: JwtService

    ) { }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }


    async registerAccount(dto: CreateAccountDto) {
        const isUserRegistered = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (isUserRegistered) {
            throw new ConflictException("Esse email já existe")
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

            return { message: "Conta registrada com Sucesso. Verifique seu email." };
        })
    }

    async verifyAccount(token: string) {
        const userEmailRegistration = await this.prisma.emailVerification.findUnique({
            where: {
                token: token
            }
        })

        if (!userEmailRegistration || userEmailRegistration.expiresAt < new Date()) throw new BadRequestException('Inválido ou Token expirado');


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

            return { message: "Conta confirmada com sucesso! Siga para o Login" }
        })
    }

    async generateTokens(userId: string) {
        const refreshTokenId = nanoid();

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                iss: process.env.JWT_ISSUER,
                sub: userId
            }, { expiresIn: '15m' }),
            this.jwtService.signAsync(
                {
                    iss: process.env.JWT_ISSUER,
                    jti: refreshTokenId,
                    sub: userId
                }, { expiresIn: '7d' }
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

        return { accessToken, refreshToken }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        })

        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const validatePassword = await argon2.verify(
            user.password,
            dto.password
        )

        if (!validatePassword) throw new UnauthorizedException("Credenciais inválidas");

        const { accessToken, refreshToken } = await this.generateTokens(user.id)

        return { accessToken: accessToken, refreshToken: refreshToken }
    }

    async refreshToken(refreshToken: string) {
        try {
            const tokenPayload = await this.jwtService.verifyAsync<{
                sub: string;
                jti: string;
            }>(refreshToken, {
                ignoreExpiration: false,
                secret: process.env.JWT_SECRET
            });

            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { userId: tokenPayload.sub, id: tokenPayload.jti },
            });

            if (!storedToken) throw new UnauthorizedException('Token de autenticação inválido')

            const isTokenValid = await argon2.verify(storedToken.token, refreshToken);

            if (!isTokenValid) throw new UnauthorizedException('Token de autenticação inválido')

            const user = await this.prisma.user.findUnique({
                where: {
                    id: tokenPayload.sub
                }
            })

            if (!user) throw new UnauthorizedException("Usuário não encontrado")

            return await this.prisma.$transaction(async (tx) => {
                const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id);

                await tx.refreshToken.delete({
                    where: { userId: tokenPayload.sub, id: tokenPayload.jti },
                })

                return {
                    access_token: accessToken,
                    refresh_token: newRefreshToken
                }
            })
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new UnauthorizedException("Token de autenticação inválido")
        }
    }

    async logout(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId: userId }
        })
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) return { message: "Se o email existir, enviaremos um link de recuperação" };

        const resetPasswordToken = nanoid(21);

        const hashedToken = this.hashToken(resetPasswordToken);


        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
        })

        await this.mailer.sendResetPasswordEmail(resetPasswordToken, user.email, user.name)

        return { message: 'Se o email existir, enviaremos um link de recuperação' }
    }

    async changeForgottenPassword(token: string, newPassword: string) {

        const hashedToken = this.hashToken(token)

        const passwordResetRequisition = await this.prisma.passwordReset.findUnique({
            where: {
                token: hashedToken
            }
        })

        if (!passwordResetRequisition) throw new BadRequestException("Credenciais inválidas");

        if (passwordResetRequisition.expiresAt < new Date()) {
            await this.prisma.passwordReset.delete({
                where: { id: passwordResetRequisition.id }
            })
            throw new BadRequestException("Token expirado, faça uma nova solicitação")
        }

        const hashedPassword = await argon2.hash(newPassword);

        return await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: passwordResetRequisition.userId },
                data: { password: hashedPassword }
            })

            await tx.passwordReset.delete({
                where: { token: hashedToken }
            })

            return { message: "Senha alterada com sucesso" }
        })

    }




}

