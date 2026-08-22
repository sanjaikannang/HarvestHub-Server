import { OrderSummary } from '../../order/order-summary.dto';

export class VerifyPaymentResponse {
    success: boolean;
    message: string;
    data?: OrderSummary;
}
