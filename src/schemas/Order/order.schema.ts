import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeliveryStatus } from 'src/utils/enum';
import { DeliveryAddress, DeliveryAddressSchema } from 'src/schemas/DeliveryAddress/delivery-address.schema';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class DeliveryStatusHistoryEntry {

    @Prop({ required: true, enum: Object.values(DeliveryStatus) })
    status: DeliveryStatus;

    @Prop({ required: true })
    timestamp: Date;

    // 'system' for automated transitions (e.g. order creation), otherwise the
    // acting user's id as a string — see database/orders.md
    @Prop({ required: true })
    updatedBy: string;

}

export const DeliveryStatusHistoryEntrySchema = SchemaFactory.createForClass(DeliveryStatusHistoryEntry);

// A completed sale after successful payment, through delivery fulfillment
// (see database/orders.md). Created by Payment & Escrow (07) on payment
// success — everything past `order_confirmed` (assignment, status
// transitions, real-time tracking) is Order & Delivery Management (08), not
// built yet.
@Schema({ timestamps: true })
export class Order {

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'BiddingSession', required: true })
    sessionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
    paymentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    farmerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'District', required: true })
    districtId: Types.ObjectId;

    @Prop({ required: true })
    winningBidAmount: number;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ type: DeliveryAddressSchema, required: true })
    deliveryAddress: DeliveryAddress;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    deliveryPartnerId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(DeliveryStatus), default: DeliveryStatus.ORDER_CONFIRMED })
    deliveryStatus: DeliveryStatus;

    @Prop({ type: [DeliveryStatusHistoryEntrySchema], required: true, default: [] })
    deliveryStatusHistory: DeliveryStatusHistoryEntry[];

}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ buyerId: 1 });
OrderSchema.index({ farmerId: 1 });
OrderSchema.index({ deliveryPartnerId: 1 });
OrderSchema.index({ districtId: 1, deliveryStatus: 1 });
