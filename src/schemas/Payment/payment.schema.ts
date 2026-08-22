import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from 'src/utils/enum';
import { DeliveryAddress, DeliveryAddressSchema } from 'src/schemas/DeliveryAddress/delivery-address.schema';

export type PaymentDocument = Payment & Document;

// Tracks the buyer's payment attempt for a won bid, from initiation through
// Razorpay to success/failure/expiry — created before an `orders` record
// exists (see database/payments.md). A session can accumulate more than one
// Payment over its lifetime: one per cascade attempt to the next-highest
// bidder on failure/expiry (see BiddingCascadeService).
@Schema({ timestamps: false })
export class Payment {

    @Prop({ type: Types.ObjectId, ref: 'BiddingSession', required: true })
    sessionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    // The current offer recipient — the original winner, or a cascaded
    // next-highest bidder (see database/payments.md)
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyerId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop()
    razorpayOrderId?: string;

    @Prop()
    razorpayPaymentId?: string;

    // Captured at checkout time (before the buyer is redirected to Razorpay) so
    // both the buyer's own verify call AND an out-of-order webhook have what
    // they need to create the Order — see PaymentService.completePaymentSuccess.
    @Prop({ type: DeliveryAddressSchema })
    deliveryAddress?: DeliveryAddress;

    @Prop({ required: true, enum: Object.values(PaymentStatus), default: PaymentStatus.INITIATED })
    status: PaymentStatus;

    @Prop({ required: true })
    paymentWindowExpiresAt: Date;

    @Prop({ required: true })
    initiatedAt: Date;

    @Prop()
    completedAt?: Date;

    // Guards the payment-window-reminder cron against re-notifying the buyer
    // every tick once they're inside the reminder window (see NotificationService)
    @Prop({ default: false })
    reminderSent: boolean;

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ sessionId: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ status: 1, paymentWindowExpiresAt: 1 });
