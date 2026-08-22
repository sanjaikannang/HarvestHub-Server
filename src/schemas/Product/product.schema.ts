import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CollectionMethod, ProductStatus, UnitOfMeasure } from 'src/utils/enum';

export type ProductDocument = Product & Document;

// A farmer's produce listing, from submission through inspection, approval,
// bidding, and sale outcome (see database/products.md). Only the pre-review
// slice of the lifecycle (submitted/under_review/changes_requested/rejected)
// is driven from this module — later stages belong to Inspection (04) and
// Bidding Engine (06).
@Schema({ timestamps: true })
export class Product {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    farmerId: Types.ObjectId;

    // Resolved server-side from the farmer's own User.districtId at creation —
    // never client-supplied (see ProductService.createProductAPI).
    @Prop({ type: Types.ObjectId, ref: 'District', required: true })
    districtId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true })
    subcategoryKey: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: [String], required: true })
    images: string[];

    @Prop({ required: true })
    estimatedQuantity: number;

    @Prop({ required: true, enum: Object.values(UnitOfMeasure) })
    unitOfMeasure: UnitOfMeasure;

    // Set after inspection (module 04) — overrides estimatedQuantity for bidding
    @Prop()
    verifiedQuantity?: number;

    @Prop()
    qualityGrade?: string;

    @Prop({ required: true })
    startingPrice: number;

    // Locked per-unit price after inspection, used as the bidding floor
    @Prop()
    finalStartingPrice?: number;

    @Prop({ required: true })
    biddingDate: Date;

    @Prop({ required: true })
    biddingStartTime: Date;

    // Defaults to biddingStartTime + 30 min, computed server-side at creation
    @Prop({ required: true })
    biddingEndTime: Date;

    @Prop({ required: true, enum: Object.values(CollectionMethod) })
    collectionMethod: CollectionMethod;

    @Prop({ required: true, enum: Object.values(ProductStatus), default: ProductStatus.SUBMITTED })
    status: ProductStatus;

    @Prop()
    rejectionReason?: string;

    @Prop()
    changeRequestNotes?: string;

    @Prop({ type: Types.ObjectId, ref: 'Inspection' })
    inspectionId?: Types.ObjectId;

}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ status: 1, biddingStartTime: 1 });
ProductSchema.index({ districtId: 1 });
ProductSchema.index({ farmerId: 1 });
ProductSchema.index({ categoryId: 1 });
