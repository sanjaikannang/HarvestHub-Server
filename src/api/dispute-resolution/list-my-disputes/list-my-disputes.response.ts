import { DisputeSummary } from '../dispute-summary.dto';

export class ListMyDisputesResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary[];
}
