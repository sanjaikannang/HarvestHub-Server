import { NotificationSummary } from '../../notification-summary.dto';

export class MarkReadResponse {
    success: boolean;
    message: string;
    data?: NotificationSummary;
}
