import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AdminDecision, CollectionMethod, RecommendedVerdict } from 'src/utils/enum';

export type InspectionDocument = Inspection & Document;

// Records the physical verification visit for a product: scheduling, the
// inspector's findings, and the district admin's final decision (see
// database/inspections.md).
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Inspection {

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'District', required: true })
    districtId: Types.ObjectId;

    // Must belong to the same district — enforced in the service layer
    // (see InspectionService.scheduleInspectionAPI)
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    inspectorId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(CollectionMethod) })
    collectionMethod: CollectionMethod;

    @Prop({ required: true })
    scheduledDate: Date;

    @Prop({ required: true })
    scheduledSlot: string;

    // Set once the inspector completes the visit
    @Prop()
    visitedAt?: Date;

    @Prop()
    verifiedQuantity?: number;

    @Prop()
    qualityGrade?: string;

    @Prop()
    conditionNotes?: string;

    @Prop({ type: [String], default: [] })
    inspectionPhotos?: string[];

    @Prop({ enum: Object.values(RecommendedVerdict) })
    recommendedVerdict?: RecommendedVerdict;

    @Prop({ enum: Object.values(AdminDecision) })
    adminDecision?: AdminDecision;

    @Prop()
    adminDecisionReason?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    decidedBy?: Types.ObjectId;

    @Prop()
    decidedAt?: Date;

}

export const InspectionSchema = SchemaFactory.createForClass(Inspection);

InspectionSchema.index({ productId: 1 });
InspectionSchema.index({ districtId: 1, scheduledDate: 1 });
InspectionSchema.index({ inspectorId: 1 });
