import { PreferredLanguage } from 'src/utils/enum';

export class UpdateLanguageResponse {
    success: boolean;
    message: string;
    data?: { preferredLanguage: PreferredLanguage };
}
