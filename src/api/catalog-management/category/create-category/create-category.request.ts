import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';
import { LocaleTextDto } from '../locale-text.dto';
import { SubcategoryDto } from '../subcategory.dto';

export class CreateCategoryRequest {

    @ValidateNested()
    @Type(() => LocaleTextDto)
    name: LocaleTextDto;

    @IsEnum(PerishabilityTier)
    perishabilityTier: PerishabilityTier;

    @IsEnum(UnitOfMeasure)
    defaultUnitOfMeasure: UnitOfMeasure;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SubcategoryDto)
    subcategories: SubcategoryDto[];

}
