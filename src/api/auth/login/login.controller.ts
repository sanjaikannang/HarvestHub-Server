import { Request, Response } from 'express';
import { LoginRequest } from './login.request';
import { LoginResponse } from './login.response';
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { setRefreshTokenCookie } from 'src/utils/cookie.util';
import { Controller, Post, Body, Req, Res, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class LoginController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    async login(
        @Body() loginData: LoginRequest,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const result = await this.authService.loginAPI(loginData, {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            setRefreshTokenCookie(res, result.tokens.refreshToken, this.configService);

            const response: LoginResponse = {
                success: true,
                message: result.user.isFirstLogin
                    ? 'Login successful. Please change your password.'
                    : 'Login successful',
                data: {
                    user: result.user,
                    tokens: {
                        accessToken: result.tokens.accessToken,
                    },
                },
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }
}
