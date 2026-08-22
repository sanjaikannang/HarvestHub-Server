import { NotificationSummary } from '../../notification-summary.dto';

export class ListMyNotificationsResponse {
    success: boolean;
    message: string;
    data?: NotificationSummary[];
}
