import { Request, Response } from 'express';
import { LogoutResponse } from './logout.response';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ConfigService } from 'src/config/config.service';
import { clearRefreshTokenCookie } from 'src/utils/cookie.util';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class LogoutController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const userId = (req as any).user?.sub;
            const email = (req as any).user?.email;
            const role = (req as any).user?.role;

            await this.authService.logoutAPI(userId, {
                email,
                role,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            clearRefreshTokenCookie(res, this.configService);

            const response: LogoutResponse = {
                success: true,
                message: 'Logged out successfully',
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Logout failed',
            })
        }
    }
}
