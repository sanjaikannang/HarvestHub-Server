import { OrderSummary } from '../order-summary.dto';

export class ListOrdersResponse {
    success: boolean;
    message: string;
    data?: OrderSummary[];
}
