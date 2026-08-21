import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDistrictRequest {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    state: string;

}
