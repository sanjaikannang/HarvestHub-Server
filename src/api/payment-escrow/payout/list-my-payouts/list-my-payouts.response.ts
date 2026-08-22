import { PayoutSummary } from '../payout-summary.dto';

export class ListMyPayoutsResponse {
    success: boolean;
    message: string;
    data?: PayoutSummary[];
}
