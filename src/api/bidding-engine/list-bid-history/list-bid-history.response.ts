import { BidSummary } from '../bidding-summary.dto';

export class ListBidHistoryResponse {
    success: boolean;
    message: string;
    data?: BidSummary[];
}
