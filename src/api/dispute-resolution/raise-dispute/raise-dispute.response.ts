import { DisputeSummary } from '../dispute-summary.dto';

export class RaiseDisputeResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary;
}
