import { ResetPasswordRequest } from './reset-password.request';
import { ResetPasswordResponse } from './reset-password.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class ResetPasswordController {
    constructor(private readonly authService: AuthService) { }

    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordData: ResetPasswordRequest,
    ) {
        try {
            const result = await this.authService.resetPasswordAPI(resetPasswordData);

            const response: ResetPasswordResponse = {
                success: true,
                message: result.message,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Reset password request failed',
            });
        }
    }
}
