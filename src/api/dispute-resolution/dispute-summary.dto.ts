import { DisputeReason, DisputeStatus } from 'src/utils/enum';

export class DisputeSummary {
    id: string;
    orderId: string;
    buyerId: string;
    reason: DisputeReason;
    description: string;
    photos: string[];
    status: DisputeStatus;
    resolvedBy?: string;
    resolutionNotes?: string;
    refundAmount?: number;
    raisedAt: Date;
    resolvedAt?: Date;
}
