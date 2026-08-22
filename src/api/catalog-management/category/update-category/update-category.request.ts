import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';
import { LocaleTextDto } from '../locale-text.dto';
import { SubcategoryDto } from '../subcategory.dto';

export class UpdateCategoryRequest {

    @IsOptional()
    @ValidateNested()
    @Type(() => LocaleTextDto)
    name?: LocaleTextDto;

    @IsOptional()
    @IsEnum(PerishabilityTier)
    perishabilityTier?: PerishabilityTier;

    @IsOptional()
    @IsEnum(UnitOfMeasure)
    defaultUnitOfMeasure?: UnitOfMeasure;

    // Full replacement of the subcategories list, when provided
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SubcategoryDto)
    subcategories?: SubcategoryDto[];

}
