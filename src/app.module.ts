import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [AuthModule, UserModule, MailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
