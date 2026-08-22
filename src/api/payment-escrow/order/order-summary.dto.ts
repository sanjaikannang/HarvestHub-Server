import { DeliveryStatus } from 'src/utils/enum';
import { DeliveryAddress } from 'src/schemas/DeliveryAddress/delivery-address.schema';

export class OrderSummary {
    id: string;
    productId: string;
    sessionId: string;
    paymentId: string;
    buyerId: string;
    farmerId: string;
    districtId: string;
    winningBidAmount: number;
    quantity: number;
    totalAmount: number;
    deliveryAddress: DeliveryAddress;
    deliveryPartnerId?: string;
    deliveryStatus: DeliveryStatus;
    deliveryStatusHistory: { status: DeliveryStatus; timestamp: Date; updatedBy: string }[];
}
