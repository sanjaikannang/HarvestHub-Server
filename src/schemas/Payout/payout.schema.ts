import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PayoutStatus } from 'src/utils/enum';

export type PayoutDocument = Payout & Document;

// Tracks the farmer's escrowed earnings for an order, released only after
// delivery is confirmed — net of platform commission (see database/payouts.md).
// Created alongside the Order (status `pending`); the release trigger
// ("delivery confirmed as Delivered") belongs to Order & Delivery Management
// (08), not built yet, so `release` is a manual admin action for now (same
// pattern as Collection Center Management's reserve/dispatch, module 05).
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Payout {

    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    farmerId: Types.ObjectId;

    @Prop({ required: true })
    grossAmount: number;

    // Snapshot of the rate applied at payout-creation time — later changes to
    // the platform commission don't retroactively affect existing payouts
    @Prop({ required: true })
    commissionPercentage: number;

    @Prop({ required: true })
    commissionAmount: number;

    @Prop({ required: true })
    netPayoutAmount: number;

    @Prop({ required: true, enum: Object.values(PayoutStatus), default: PayoutStatus.PENDING })
    status: PayoutStatus;

    @Prop()
    holdReason?: string;

    @Prop()
    releasedAt?: Date;

}

export const PayoutSchema = SchemaFactory.createForClass(Payout);

PayoutSchema.index({ orderId: 1 }, { unique: true });
PayoutSchema.index({ farmerId: 1, status: 1 });
