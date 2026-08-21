import { ForgotPasswordRequest } from './forgot-password.request';
import { ForgotPasswordResponse } from './forgot-password.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class ForgotPasswordController {
    constructor(private readonly authService: AuthService) { }

    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordData: ForgotPasswordRequest,
    ) {
        try {
            const result = await this.authService.forgotPasswordAPI(forgotPasswordData.identifier);

            const response: ForgotPasswordResponse = {
                success: true,
                message: result.message,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Forgot password request failed',
            });
        }
    }
}
