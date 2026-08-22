import { NotificationChannel, NotificationType } from 'src/utils/enum';

class TranslationPairDto {
    title: string;
    message: string;
}

export class TemplateSummary {
    id: string;
    templateKey: NotificationType;
    channel: NotificationChannel;
    translations: { en: TranslationPairDto; ta: TranslationPairDto };
    isActive: boolean;
}
