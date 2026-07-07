import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './common/mail/mail.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [AuthModule, UserModule, MailModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
