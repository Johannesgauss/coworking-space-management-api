import { Controller, Get, HttpCode, HttpStatus, Patch, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@User('id') userId: string) {
        return this.userService.getMe(userId);
    }

    @Put('me')
    @HttpCode(HttpStatus.OK)
    updatePersonalUserData(@User('id') userId: string, dto: UpdateUserDto) {
        return this.userService.updateUserData(userId, dto)
    }
}
