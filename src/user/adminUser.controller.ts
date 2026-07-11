import { Controller, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../common/decorators/roles.decorator';

@Roles('ADMIN')
@Controller('admin/users')
export class AdminUserController {
    constructor(private readonly userService: UserService) {}

    @Patch(':id')
    promoteToAdmin(@Param('id') id: string) {
        return this.userService.promoteToAdmin(id);
    }
}
