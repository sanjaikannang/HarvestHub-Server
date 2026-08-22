import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeliveryPartnerAvailability } from 'src/utils/enum';

export type DeliveryPartnerProfileDocument = DeliveryPartnerProfile & Document;

// Delivery Partner-specific details used by Order & Delivery Management's
// auto-assignment logic — one profile per DELIVERY_PARTNER user, created
// alongside the account (see AuthService.createDeliveryPartnerAPI).
@Schema({ timestamps: true })
export class DeliveryPartnerProfile {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'District', required: true })
    districtsServiced: Types.ObjectId[];

    @Prop({ required: true })
    vehicleType: string;

    @Prop({ required: true })
    vehicleNumber: string;

    @Prop({ required: true })
    capacityKg: number;

    @Prop({ required: true, enum: Object.values(DeliveryPartnerAvailability), default: DeliveryPartnerAvailability.AVAILABLE })
    currentStatus: DeliveryPartnerAvailability;

    @Prop({ required: true, default: 0 })
    activeOrderCount: number;

    @Prop()
    rating?: number;

}

export const DeliveryPartnerProfileSchema = SchemaFactory.createForClass(DeliveryPartnerProfile);

DeliveryPartnerProfileSchema.index({ userId: 1 }, { unique: true });
DeliveryPartnerProfileSchema.index({ districtsServiced: 1, currentStatus: 1, activeOrderCount: 1 });
