import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: CreateAccountDto) {
        return this.authService.registerAccount(dto);
    }

    @Public()
    @Get('verify-email')
    @HttpCode(HttpStatus.ACCEPTED)
    verifyAccount(@Query('token') token: string) {
        return this.authService.verifyAccount(token)
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@User('id') userId: string) {
        return this.authService.logout(userId)
    }


}
