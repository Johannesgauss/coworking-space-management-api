import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/decorators/user.decorator';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/auth',
};

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.OK)
    register(@Body() dto: CreateAccountDto) {
        return this.authService.registerAccount(dto);
    }

    @Public()
    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    verifyAccount(@Query('token') token: string) {
        return this.authService.verifyAccount(token)
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken } = await this.authService.login(dto);
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
        return { access_token: accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@User('id') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(userId);
        res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
        return { message: 'Logout realizado com sucesso' };
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    requestForgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetForgottenPassword(@Query('token') token: string, @Body('password') password: string) {
        return this.authService.changeForgottenPassword(token, password)
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(@User('id') userId: string, @Body('password') password: string) {
        return this.authService.changePassword(userId, password)
    }

    @Delete('me')
    @HttpCode(HttpStatus.OK)
    deleteAccount(@User('id') userId: string, @Body('password') password: string) {
        return this.authService.deleteAccount(userId, password);
    }

    @Public()
    @Post('regenerate')
    @HttpCode(HttpStatus.OK)
    async regenerateToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        if (!refreshToken) throw new UnauthorizedException('Refresh token não encontrado');

        const { access_token, refresh_token } = await this.authService.refreshToken(refreshToken);
        res.cookie(REFRESH_TOKEN_COOKIE, refresh_token, refreshCookieOptions);
        return { access_token };
    }


}
