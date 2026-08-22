import { OrderSummary } from '../order-summary.dto';

export class GetOrderResponse {
    success: boolean;
    message: string;
    data?: OrderSummary;
}
