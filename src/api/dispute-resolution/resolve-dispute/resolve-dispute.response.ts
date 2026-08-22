import { DisputeSummary } from '../dispute-summary.dto';

export class ResolveDisputeResponse {
    success: boolean;
    message: string;
    data?: DisputeSummary;
}
