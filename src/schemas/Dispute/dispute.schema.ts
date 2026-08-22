import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DisputeReason, DisputeStatus } from 'src/utils/enum';

export type DisputeDocument = Dispute & Document;

// A buyer-raised quality/condition complaint against a delivered order, and
// its District Admin/Super Admin resolution — which can claw back or reduce
// the associated farmer payout (see database/disputes.md).
@Schema({ timestamps: false })
export class Dispute {

    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyerId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(DisputeReason) })
    reason: DisputeReason;

    @Prop({ required: true })
    description: string;

    @Prop({ type: [String], default: [] })
    photos: string[];

    @Prop({ required: true, enum: Object.values(DisputeStatus), default: DisputeStatus.RAISED })
    status: DisputeStatus;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    resolvedBy?: Types.ObjectId;

    @Prop()
    resolutionNotes?: string;

    // Set only when status is resolved_refund
    @Prop()
    refundAmount?: number;

    @Prop({ required: true })
    raisedAt: Date;

    @Prop()
    resolvedAt?: Date;

}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

DisputeSchema.index({ orderId: 1 }, { unique: true });
DisputeSchema.index({ status: 1 });
