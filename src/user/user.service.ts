import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ShowUserDto } from './dto/show-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

    async updateUserData(userId: string, dto: UpdateUserDto){
        const user = await this.prisma.user.findUnique({
            where: {id: userId}
        })

        if (!user) throw new NotFoundException('Usuário não encontrado');

        await this.prisma.user.update({
            where: {id: userId},
            data: {
                name: dto.name,
                lastName: dto.lastName
            }
        })

        return {message: "Dados atualizados com sucesso"}
    }
}
