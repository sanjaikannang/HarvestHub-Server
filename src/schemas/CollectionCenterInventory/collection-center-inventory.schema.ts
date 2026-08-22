import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InventoryStatus } from 'src/utils/enum';

export type CollectionCenterInventoryDocument = CollectionCenterInventory & Document;

// Tracks a product's physical stock at a Collection Center, from receipt
// through dispatch (see database/collection-center-inventory.md). Only the
// receipt side (written by Inspection, module 04, on approval) is used today
// — reserved_for_sale/dispatched belong to modules 06/08, not built yet. Full
// CRUD/reporting on this collection is Collection Center Management (05).
@Schema({ timestamps: false })
export class CollectionCenterInventory {

    @Prop({ type: Types.ObjectId, ref: 'CollectionCenter', required: true })
    collectionCenterId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    receivedQuantity: number;

    @Prop({ required: true })
    receivedDate: Date;

    @Prop({ required: true, enum: Object.values(InventoryStatus), default: InventoryStatus.IN_STORAGE })
    status: InventoryStatus;

    @Prop()
    reservedAt?: Date;

    @Prop()
    dispatchedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    deliveryPartnerId?: Types.ObjectId;

}

export const CollectionCenterInventorySchema = SchemaFactory.createForClass(CollectionCenterInventory);

CollectionCenterInventorySchema.index({ productId: 1 }, { unique: true });
CollectionCenterInventorySchema.index({ collectionCenterId: 1, status: 1 });
