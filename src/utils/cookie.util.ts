import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

function parseDurationToMs(duration: string): number {
    const match = /^(\d+)\s*([smhd])$/i.exec(duration.trim());
    if (!match) {
        return 30 * 24 * 60 * 60 * 1000; // fallback: 30 days
    }

    const value = Number(match[1]);
    const unitMs: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * unitMs[match[2].toLowerCase()];
}

function getRefreshCookieBaseOptions(configService: ConfigService) {
    const isProduction = configService.getNodeEnv() === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
        path: '/auth',
    };
}

export function setRefreshTokenCookie(res: Response, refreshToken: string, configService: ConfigService): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        ...getRefreshCookieBaseOptions(configService),
        maxAge: parseDurationToMs(configService.getJwtRefreshExpiry()),
    });
}

export function clearRefreshTokenCookie(res: Response, configService: ConfigService): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieBaseOptions(configService));
}
