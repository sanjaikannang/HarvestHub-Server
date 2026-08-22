import { OrderSummary } from '../order-summary.dto';

export class UpdateOrderStatusResponse {
    success: boolean;
    message: string;
    data?: OrderSummary;
}
