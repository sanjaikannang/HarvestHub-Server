import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, ValidateNested } from 'class-validator';
import { CollectionCenterAddressDto } from '../collection-center-address.dto';

// name/address/contactPhone/capacityKg may be updated by a District Admin for
// their own collection center; isActive is Super Admin-only (see
// CollectionCenterService.updateCollectionCenterAPI).
export class UpdateCollectionCenterRequest {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CollectionCenterAddressDto)
    address?: CollectionCenterAddressDto;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    contactPhone?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    capacityKg?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}
