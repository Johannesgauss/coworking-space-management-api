import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NotificationService } from 'src/common/mail/notification.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  providers: [AuthService, NotificationService],
  controllers: [AuthController],
  imports: [PrismaModule]
})
export class AuthModule {}
