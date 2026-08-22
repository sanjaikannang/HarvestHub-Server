import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';

class TranslationPairRequest {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}

export class UpdateTemplateRequest {

    @ValidateNested()
    @Type(() => TranslationPairRequest)
    en: TranslationPairRequest;

    @ValidateNested()
    @Type(() => TranslationPairRequest)
    ta: TranslationPairRequest;

}
