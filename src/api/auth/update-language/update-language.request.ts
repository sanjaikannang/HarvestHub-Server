import { IsEnum } from 'class-validator';
import { PreferredLanguage } from 'src/utils/enum';

export class UpdateLanguageRequest {

    @IsEnum(PreferredLanguage)
    preferredLanguage: PreferredLanguage;

}
