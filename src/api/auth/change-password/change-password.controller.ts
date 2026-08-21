import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChangePasswordRequest } from './change-password.request';
import { ChangePasswordResponse } from './change-password.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class ChangePasswordController {
    constructor(private readonly authService: AuthService) { }

    @Post('change-password')
    async changePassword(
        @Body() changePasswordData: ChangePasswordRequest,
    ) {
        try {
            await this.authService.changePasswordAPI(changePasswordData);

            const response: ChangePasswordResponse = {
                success: true,
                message: 'Password changed successfully',
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Password change failed',
            })
        }
    }
}
