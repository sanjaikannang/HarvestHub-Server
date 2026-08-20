import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsMongoId, MinLength } from 'class-validator';
import { UserRole } from 'src/utils/enum';

// Self-registration — restricted to FARMER/BUYER by AuthService.registerAPI
export class RegisterRequest {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
