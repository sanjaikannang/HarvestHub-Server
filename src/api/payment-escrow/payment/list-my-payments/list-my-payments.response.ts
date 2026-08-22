import { PaymentSummary } from '../payment-summary.dto';

export class ListMyPaymentsResponse {
    success: boolean;
    message: string;
    data?: PaymentSummary[];
}
