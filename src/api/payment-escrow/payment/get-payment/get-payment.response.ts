import { PaymentSummary } from '../payment-summary.dto';

export class GetPaymentResponse {
    success: boolean;
    message: string;
    data?: PaymentSummary;
}
