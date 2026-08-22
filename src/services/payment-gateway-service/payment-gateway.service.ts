import Razorpay from 'razorpay';
import { ConfigService } from 'src/config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

export interface RazorpayOrderResult {
    id: string;
    amount: number;
    currency: string;
}

// Thin wrapper around the Razorpay SDK — isolates the one external
// dependency so the rest of the Payment & Escrow module only ever talks to
// this interface, never the SDK directly.
@Injectable()
export class PaymentGatewayService {
    private readonly client: Razorpay;

    constructor(private readonly configService: ConfigService) {
        this.client = new Razorpay({
            key_id: this.configService.getRazorpayKeyId(),
            key_secret: this.configService.getRazorpayKeySecret(),
        });
    }

    getKeyId(): string {
        return this.configService.getRazorpayKeyId();
    }

    // Amount must be in the smallest currency unit (paise for INR)
    async createOrder(amountInPaise: number, receipt: string): Promise<RazorpayOrderResult> {
        try {
            const order = await this.client.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt,
            });
            return { id: order.id, amount: Number(order.amount), currency: order.currency };
        } catch (error) {
            throw new InternalServerErrorException('Failed to create Razorpay order', error);
        }
    }

    // Verifies the signature Razorpay Checkout returns to the client after a
    // successful payment. This is the same HMAC-SHA256-over-a-string check as
    // a webhook signature (see Razorpay.validateWebhookSignature), just
    // applied to `${orderId}|${paymentId}` with the key secret instead of the
    // webhook secret — see https://razorpay.com/docs/payments/server-integration/nodejs/build-integration/#3-verify-payment-signature
    verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
        return Razorpay.validateWebhookSignature(
            `${razorpayOrderId}|${razorpayPaymentId}`,
            signature,
            this.configService.getRazorpayKeySecret(),
        );
    }

    // Verifies a Razorpay webhook payload against its X-Razorpay-Signature header
    verifyWebhookSignature(rawBody: string, signature: string): boolean {
        return Razorpay.validateWebhookSignature(rawBody, signature, this.configService.getRazorpayWebhookSecret());
    }

}
