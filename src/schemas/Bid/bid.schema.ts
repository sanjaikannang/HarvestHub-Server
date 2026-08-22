import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BidDocument = Bid & Document;

// Immutable log of every bid successfully placed in a session — never
// updated after creation (see database/bids.md).
@Schema({ timestamps: false })
export class Bid {

    @Prop({ type: Types.ObjectId, ref: 'BiddingSession', required: true })
    sessionId: Types.ObjectId;

    // Denormalized for direct querying (see database/bids.md)
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyerId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    // Server-received timestamp — the tie-breaker between equal bid amounts
    @Prop({ required: true })
    placedAt: Date;

}

export const BidSchema = SchemaFactory.createForClass(Bid);

BidSchema.index({ sessionId: 1, amount: -1, placedAt: 1 });
BidSchema.index({ buyerId: 1 });
