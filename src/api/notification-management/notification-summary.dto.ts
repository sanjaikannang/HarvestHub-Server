import { NotificationChannel, NotificationType, PreferredLanguage } from 'src/utils/enum';

export class NotificationSummary {
    id: string;
    type: NotificationType;
    locale: PreferredLanguage;
    title: string;
    message: string;
    channel: NotificationChannel;
    relatedEntityType?: string;
    relatedEntityId?: string;
    isRead: boolean;
    createdAt: Date;
}
