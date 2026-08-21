import { IsString, IsNotEmpty } from 'class-validator';

export class LocaleTextDto {

    @IsString()
    @IsNotEmpty()
    en: string;

    @IsString()
    @IsNotEmpty()
    ta: string;

}
