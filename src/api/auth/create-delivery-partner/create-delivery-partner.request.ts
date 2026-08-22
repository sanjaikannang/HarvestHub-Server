import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, IsArray, IsMongoId, IsNumber, Min, ArrayMinSize } from 'class-validator';

export class CreateDeliveryPartnerRequest {

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

    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    districtsServiced: string[];

    @IsString()
    @IsNotEmpty()
    vehicleType: string;

    @IsString()
    @IsNotEmpty()
    vehicleNumber: string;

    @IsNumber()
    @Min(1)
    capacityKg: number;

}
