import { Controller, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUserController {
    constructor(private readonly userService: UserService) {}

    @Patch(':id')
    promoteToAdmin(@Param('id') id: string) {
        return this.userService.promoteToAdmin(id);
    }
}
