import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequest {
    @IsString()
    @IsNotEmpty()
    identifier: string;
}
