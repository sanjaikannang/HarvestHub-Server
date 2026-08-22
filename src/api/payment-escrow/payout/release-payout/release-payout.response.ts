import { PayoutSummary } from '../payout-summary.dto';

export class ReleasePayoutResponse {
    success: boolean;
    message: string;
    data?: PayoutSummary;
}
