import { DisputeSummary } from '../dispute-summary.dto';

export class ListDisputesResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary[];
}
