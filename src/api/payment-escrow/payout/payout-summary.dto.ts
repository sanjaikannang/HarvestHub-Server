import { PayoutStatus } from 'src/utils/enum';

export class PayoutSummary {
    id: string;
    orderId: string;
    farmerId: string;
    grossAmount: number;
    commissionPercentage: number;
    commissionAmount: number;
    netPayoutAmount: number;
    status: PayoutStatus;
    holdReason?: string;
    releasedAt?: Date;
}
