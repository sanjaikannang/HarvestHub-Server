import { DisputeSummary } from '../dispute-summary.dto';

export class GetDisputeResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary;
}
