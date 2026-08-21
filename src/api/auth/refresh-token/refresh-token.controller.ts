import { Request, Response } from 'express';
import { RefreshTokenResponse } from './refresh-token.response';
import { ConfigService } from 'src/config/config.service';
import { setRefreshTokenCookie } from 'src/utils/cookie.util';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Req, Res, UnauthorizedException, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class RefreshTokenController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('refresh-token')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new UnauthorizedException('Refresh token not found');
            }

            const tokens = await this.authService.refreshTokenAPI(refreshToken);

            setRefreshTokenCookie(res, tokens.refreshToken, this.configService);

            const response: RefreshTokenResponse = {
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: tokens.accessToken,
                },
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Token refresh failed',
            })
        }
    }
}
