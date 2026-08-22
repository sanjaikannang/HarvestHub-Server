import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BiddingOutcome, BiddingSessionStatus } from 'src/utils/enum';

export type BiddingSessionDocument = BiddingSession & Document;

@Schema({ _id: false })
export class CurrentHighestBid {

    @Prop({ required: true })
    amount: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    bidderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Bid', required: true })
    bidId: Types.ObjectId;

}

export const CurrentHighestBidSchema = SchemaFactory.createForClass(CurrentHighestBid);

// One live/scheduled/ended bidding session per product; tracks timing
// (including anti-sniping extensions), current highest bid, and final outcome
// (see database/bidding-sessions.md).
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class BiddingSession {

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    startTime: Date;

    @Prop({ required: true })
    originalEndTime: Date;

    // Mutated on each anti-sniping extension — see BiddingRepositoryService.tryPlaceBid
    @Prop({ required: true })
    currentEndTime: Date;

    @Prop({ required: true, enum: Object.values(BiddingSessionStatus), default: BiddingSessionStatus.SCHEDULED })
    status: BiddingSessionStatus;

    @Prop({ required: true })
    minIncrement: number;

    @Prop({ type: CurrentHighestBidSchema })
    currentHighestBid?: CurrentHighestBid;

    @Prop({ required: true, default: 0 })
    extensionCount: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    winnerId?: Types.ObjectId;

    @Prop()
    winningBidAmount?: number;

    @Prop({ enum: Object.values(BiddingOutcome) })
    outcome?: BiddingOutcome;

}

export const BiddingSessionSchema = SchemaFactory.createForClass(BiddingSession);

BiddingSessionSchema.index({ productId: 1 }, { unique: true });
BiddingSessionSchema.index({ status: 1, currentEndTime: 1 });
