import { Type } from 'class-transformer';
import { CollectionMethod, UnitOfMeasure } from 'src/utils/enum';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ArrayMinSize,
    Min,
} from 'class-validator';

export class UpdateProductRequest {

    @IsOptional()
    @IsMongoId()
    categoryId?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    subcategoryKey?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0.01)
    estimatedQuantity?: number;

    @IsOptional()
    @IsEnum(UnitOfMeasure)
    unitOfMeasure?: UnitOfMeasure;

    @IsOptional()
    @IsNumber()
    @Min(0.01)
    startingPrice?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    biddingDate?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    biddingStartTime?: Date;

    @IsOptional()
    @IsEnum(CollectionMethod)
    collectionMethod?: CollectionMethod;

}
