import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDistrictRequest {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    state?: string;

}
