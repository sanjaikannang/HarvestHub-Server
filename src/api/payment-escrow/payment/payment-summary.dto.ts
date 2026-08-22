import { PaymentStatus } from 'src/utils/enum';

export class PaymentSummary {
    id: string;
    sessionId: string;
    productId: string;
    buyerId: string;
    amount: number;
    status: PaymentStatus;
    razorpayOrderId?: string;
    paymentWindowExpiresAt: Date;
    initiatedAt: Date;
    completedAt?: Date;
}

export class CheckoutSummary {
    paymentId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
}
