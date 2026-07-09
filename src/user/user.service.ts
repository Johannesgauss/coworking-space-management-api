import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ShowUserDto } from './dto/show-user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService
    ){}
    async getMe(userId: string): Promise<ShowUserDto> {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            omit: {password: true}
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        return {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role 
        };
    }
}
