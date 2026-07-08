import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
    constructor (
        private readonly mailer: MailerService
    ){}

    async sendRegistrationEmail(token: string, email: string, name: string){
        const resetLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`

        await this.mailer.sendMail({
            to: email,
            subject: 'Confirme seu registro',
            html: `
            <p>Olá, ${name}!<p>
            <p>Recebemos sua inscrição em nosso serviço de controle de salas. Para confirmar sua conta e acessar nossos serviços, clique no link a seguir:<p>

            <a href="${resetLink}">Confirme sua conta<a>

            <p>Esse link expirará dentro de 15 minutos<p>

            <p>Se você não se registrou, ignore este email.<p>
            `
        })
    }

    async sendResetPasswordEmail(token: string, email: string, name: string){
        const resetLink = `${process.env.FRONTEND_URL}/auth/forgot-password-reset?token=${token}`

        await this.mailer.sendMail({
            to: email,
            subject: 'Confirme seu registro',
            html: `
            <h1>Olá, ${name}<h1>
            <p>Para recuperar a senha da sua conta, por favor, clique no link abaixo:<p>

            <a href="${resetLink}">Mude altere sua senha<a>

            <p>Esse link expirará dentro de 15 minutos<p>

            <p>Se você não solicitou a mudança de senha, ignore este email.<p>
            `
        })
    }
}