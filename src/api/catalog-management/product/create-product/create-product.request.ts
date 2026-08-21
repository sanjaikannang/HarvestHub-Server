import { Type } from 'class-transformer';
import { CollectionMethod, UnitOfMeasure } from 'src/utils/enum';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsString,
    ArrayMinSize,
    Min,
} from 'class-validator';

// biddingEndTime is intentionally absent — it's always computed server-side
// as biddingStartTime + 30 minutes (see modules/03-catalog-management/requirement.md).
export class CreateProductRequest {

    @IsMongoId()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    subcategoryKey: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    images: string[];

    @IsNumber()
    @Min(0.01)
    estimatedQuantity: number;

    @IsEnum(UnitOfMeasure)
    unitOfMeasure: UnitOfMeasure;

    @IsNumber()
    @Min(0.01)
    startingPrice: number;

    @IsDate()
    @Type(() => Date)
    biddingDate: Date;

    @IsDate()
    @Type(() => Date)
    biddingStartTime: Date;

    @IsEnum(CollectionMethod)
    collectionMethod: CollectionMethod;

}
