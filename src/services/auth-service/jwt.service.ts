import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/utils/enum';
import { ConfigService } from 'src/config/config.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface JwtPayload {
    sub: string;
    email?: string;
    phone: string;
    role: UserRole;
    type: 'access' | 'refresh';
}

export interface PasswordResetJwtPayload {
    sub: string;
    identifier: string;
    purpose: 'password-reset';
}

@Injectable()
export class AuthJwtService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }


    // Generate Access Tokens
    generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
        try {
            const token = this.jwtService.sign(
                { ...payload, type: 'access' },
                {
                    secret: this.configService.getJWTSecretKey(),
                    expiresIn: this.configService.getJWTExpiresIn(),
                },
            );
            return token;
        } catch (error) {
            throw new UnauthorizedException('Failed to generate access token', error);
        }
    }


    // Generate Refresh Tokens
    generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
        try {
            const token = this.jwtService.sign(
                { ...payload, type: 'refresh' },
                {
                    secret: this.configService.getJwtRefreshSecretKey(),
                    expiresIn: this.configService.getJwtRefreshExpiry(),
                },
            );
            return token;
        } catch (error) {
            throw new UnauthorizedException('Failed to generate refresh token', error);
        }
    }


    // Verify Access Token
    verifyAccessToken(token: string): JwtPayload {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getJWTSecretKey(),
            });

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token', error);
        }
    }


    // Verify Refresh Token
    verifyRefreshToken(token: string): JwtPayload {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getJwtRefreshSecretKey(),
            });

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token', error);
        }
    }


    // Generate Password Reset Token
    generatePasswordResetToken(payload: Omit<PasswordResetJwtPayload, 'purpose'>): string {
        try {
            const token = this.jwtService.sign(
                { ...payload, purpose: 'password-reset' },
                {
                    secret: this.configService.getPasswordResetJwtSecretKey(),
                    expiresIn: '10m',
                },
            );
            return token;
        } catch (error) {
            throw new UnauthorizedException('Failed to generate password reset token', error);
        }
    }


    // Verify Password Reset Token
    verifyPasswordResetToken(token: string): PasswordResetJwtPayload {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getPasswordResetJwtSecretKey(),
            });

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired password reset token', error);
        }
    }


    // Decode Token
    decodeToken(token: string): any {
        try {
            const decodeToken = this.jwtService.decode(token);
            return decodeToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid token', error);
        }
    }

}
