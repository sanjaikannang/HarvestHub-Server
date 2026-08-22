import { PayoutSummary } from '../payout-summary.dto';

export class ListPayoutsResponse {
    success: boolean;
    message: string;
    data?: PayoutSummary[];
}
