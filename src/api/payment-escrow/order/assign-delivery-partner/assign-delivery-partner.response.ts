import { OrderSummary } from '../order-summary.dto';

export class AssignDeliveryPartnerResponse {
    success: boolean;
    message: string;
    data?: OrderSummary;
}
