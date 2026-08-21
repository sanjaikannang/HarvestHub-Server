import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { CollectionCenterAddressDto } from '../collection-center-address.dto';

export class CreateCollectionCenterRequest {

    @IsMongoId()
    districtId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested()
    @Type(() => CollectionCenterAddressDto)
    address: CollectionCenterAddressDto;

    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    capacityKg?: number;

}
