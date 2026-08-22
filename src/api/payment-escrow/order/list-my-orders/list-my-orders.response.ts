import { OrderSummary } from '../order-summary.dto';

export class ListMyOrdersResponse {
    success: boolean;
    message: string;
    data?: OrderSummary[];
}
