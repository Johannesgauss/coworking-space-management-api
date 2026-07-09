import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './common/mail/mail.module';
import { RoomModule } from './room/room.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './common/guards/role.guards';

@Module({
  imports: [AuthModule, UserModule, MailModule, RoomModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard},
    {provide: APP_GUARD, useClass: RolesGuard}
  ],
})
export class AppModule {}
