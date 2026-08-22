import { BidSummary } from '../bidding-summary.dto';

export class ListMyBidsResponse {
    success: boolean;
    message: string;
    data?: BidSummary[];
}
