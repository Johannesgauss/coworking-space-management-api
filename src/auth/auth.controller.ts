import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    register(@Body() dto: CreateAccountDto) {
        return this.authService.registerAccount(dto);
    }

    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    verifyAccount(@Query('token') token: string) {
        return this.authService.verifyAccount(token)
    }
}
