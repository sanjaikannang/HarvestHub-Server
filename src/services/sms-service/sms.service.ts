import { Injectable, Logger } from '@nestjs/common';

// Thin wrapper around an SMS provider (Twilio/MSG91/etc.) — requirement.md
// calls out that farmers in particular may prefer SMS over in-app-only
// notifications, but no provider credentials exist yet. Scaffolded the same
// way PaymentGatewayService was before real Razorpay keys arrived: the call
// site and message content are real, delivery is a logged no-op until a
// provider is configured.
@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    async send(phone: string, message: string): Promise<void> {
        // TODO: wire a real provider once one is chosen/credentialed
        this.logger.warn(`SMS provider not configured — would send to ${phone}: ${message}`);
    }

}
