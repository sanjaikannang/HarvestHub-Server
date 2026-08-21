import { IsString, IsNotEmpty } from 'class-validator';

export class CollectionCenterAddressDto {

    @IsString()
    @IsNotEmpty()
    line1: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    pincode: string;

}
