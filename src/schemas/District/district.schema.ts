import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DistrictDocument = District & Document;

// The multi-tenancy root entity — every Farmer, Product, Order, and Delivery
// Partner is scoped to a district (see database/districts.md).
@Schema({ timestamps: true })
export class District {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    state: string;

    // Null until an admin is assigned (see assign-district-admin). Enforced as
    // 1 district <-> 1 admin at the service layer, not the schema level.
    @Prop({ type: Types.ObjectId, ref: 'User' })
    districtAdminId?: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;

}

export const DistrictSchema = SchemaFactory.createForClass(District);

DistrictSchema.index({ name: 1, state: 1 }, { unique: true });
