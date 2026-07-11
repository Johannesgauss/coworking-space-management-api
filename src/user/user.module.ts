import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminUserController } from './adminUser.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  providers: [UserService],
  imports: [PrismaModule],
  controllers: [UserController, AdminUserController]
})
export class UserModule {}
