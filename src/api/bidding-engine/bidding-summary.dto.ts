import { BiddingOutcome, BiddingSessionStatus } from 'src/utils/enum';

export class CurrentHighestBidSummary {
    amount: number;
    bidderId: string;
    bidId: string;
}

// Shared response shape for a single bidding session.
export class BiddingSessionSummary {
    id: string;
    productId: string;
    startTime: Date;
    originalEndTime: Date;
    currentEndTime: Date;
    status: BiddingSessionStatus;
    minIncrement: number;
    currentHighestBid?: CurrentHighestBidSummary;
    extensionCount: number;
    winnerId?: string;
    winningBidAmount?: number;
    outcome?: BiddingOutcome;
}

// Shared response shape for a single logged bid.
export class BidSummary {
    id: string;
    sessionId: string;
    productId: string;
    buyerId: string;
    amount: number;
    placedAt: Date;
}
