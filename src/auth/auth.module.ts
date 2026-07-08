import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NotificationService } from 'src/common/mail/notification.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import {JwtModule } from '@nestjs/jwt'

@Module({
  imports: [PrismaModule,NotificationService, JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '15m'}
    })],
  providers: [AuthService],
  controllers: [AuthController]})
export class AuthModule {}
