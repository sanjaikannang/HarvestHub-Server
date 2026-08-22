import { DisputeSummary } from '../dispute-summary.dto';

export class StartReviewResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary;
}
