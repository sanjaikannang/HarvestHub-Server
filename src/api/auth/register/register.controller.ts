import { RegisterRequest } from './register.request';
import { RegisterResponse } from './register.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class RegisterController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() registerData: RegisterRequest,
    ) {
        try {
            const data = await this.authService.registerAPI(registerData);

            const response: RegisterResponse = {
                success: true,
                message: 'Registration successful. You can now log in.',
                data,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }
}
