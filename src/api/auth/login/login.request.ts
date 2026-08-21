import { IsString, IsNotEmpty } from 'class-validator';

export class LoginRequest {

    // Phone or email — HarvestHub logs in with either (see users.md)
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}
