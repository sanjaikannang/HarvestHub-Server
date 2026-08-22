import { BiddingSessionSummary } from '../bidding-summary.dto';

export class PlaceBidResponse {
    success: boolean;
    message: string;
    data?: BiddingSessionSummary;
}
