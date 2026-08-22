import { CheckoutSummary } from '../payment-summary.dto';

export class CheckoutResponse {
    success: boolean;
    message: string;
    data?: CheckoutSummary;
}
