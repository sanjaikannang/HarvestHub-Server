import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordRequest {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(8)
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
