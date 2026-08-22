import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Shared by Payment (captured at checkout time) and Order (the snapshot
// carried forward) — see database/orders.md. Buyer-supplied ad-hoc at
// checkout rather than pulled from a saved `buyer-profiles` entry, since
// that collection doesn't exist yet.
@Schema({ _id: false })
export class DeliveryAddress {

    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    line1: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    pincode: string;

}

export const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);
