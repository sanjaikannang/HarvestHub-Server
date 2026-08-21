import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CollectionCenterDocument = CollectionCenter & Document;

@Schema({ _id: false })
export class CollectionCenterAddress {

    @Prop({ required: true })
    line1: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    pincode: string;

}

export const CollectionCenterAddressSchema = SchemaFactory.createForClass(CollectionCenterAddress);

// The physical district office/hub where inspected produce is held before
// sale, and from where Delivery Partners pick up sold goods (see
// database/collection-centers.md).
@Schema({ timestamps: true })
export class CollectionCenter {

    @Prop({ type: Types.ObjectId, ref: 'District', required: true })
    districtId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: CollectionCenterAddressSchema, required: true })
    address: CollectionCenterAddress;

    @Prop({ required: true })
    contactPhone: string;

    @Prop()
    capacityKg?: number;

    @Prop({ default: true })
    isActive: boolean;

}

export const CollectionCenterSchema = SchemaFactory.createForClass(CollectionCenter);

CollectionCenterSchema.index({ districtId: 1 });
