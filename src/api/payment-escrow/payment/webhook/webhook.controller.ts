import { PaymentService } from 'src/services/payment-service/payment.service';
import { Controller, Post, RawBody, Headers, HttpCode } from '@nestjs/common';

// No JwtAuthGuard — Razorpay calls this server-to-server. Authenticity comes
// from the X-Razorpay-Signature header (HMAC over the raw body with the
// webhook secret), verified inside PaymentService.handleWebhookAPI. Always
// responds 200 once the signature checks out — even for events we ignore —
// so Razorpay doesn't endlessly retry a delivery we've already understood.
@Controller('payments')
export class WebhookController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('x-razorpay-signature') signature: string,
    ): Promise<{ received: true }> {
        await this.paymentService.handleWebhookAPI(rawBody.toString('utf8'), signature);
        return { received: true };
    }
}
