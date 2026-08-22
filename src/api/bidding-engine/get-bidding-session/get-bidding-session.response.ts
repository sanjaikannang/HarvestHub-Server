import { BiddingSessionSummary } from '../bidding-summary.dto';

export class GetBiddingSessionResponse {
    success: boolean;
    message: string;
    data?: BiddingSessionSummary;
}
