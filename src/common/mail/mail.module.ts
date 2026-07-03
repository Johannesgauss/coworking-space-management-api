import { Module } from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer'
import 'dotenv/config';
import { NotificationService } from './notification.service';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT),
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            },
            defaults: {
                from: `"Não Responda" <${process.env.MAIL_FROM}>`,
            },
        }),
    ],
    providers: [NotificationService],
    exports: [NotificationService]
})

export class MailModule {}