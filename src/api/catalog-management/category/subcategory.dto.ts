import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { LocaleTextDto } from './locale-text.dto';

export class SubcategoryDto {

    @IsString()
    @IsNotEmpty()
    key: string;

    @ValidateNested()
    @Type(() => LocaleTextDto)
    name: LocaleTextDto;

}
