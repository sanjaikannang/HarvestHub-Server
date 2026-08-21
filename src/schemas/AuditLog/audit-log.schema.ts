import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

// Known action strings logged by the Catalog module (03). `action` itself
// stays a plain string on the schema (see database/audit-logs.md — it's
// documented as open-ended, "e.g. product_approved, ...") so later modules
// (disputes, bidding, admin dashboard) can log their own without touching
// this schema.
export enum AuditAction {
    PRODUCT_REVIEW_STARTED = 'product_review_started',
    PRODUCT_CHANGES_REQUESTED = 'product_changes_requested',
    PRODUCT_REJECTED = 'product_rejected',
    PRODUCT_RESUBMITTED = 'product_resubmitted',
}

// Immutable record of significant admin/system decisions, for compliance and
// dispute reference (see database/audit-logs.md). No `updatedAt` — entries
// are never modified after creation.
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    actorId: Types.ObjectId;

    @Prop({ required: true })
    actorRole: string;

    @Prop({ required: true })
    action: string;

    @Prop({ required: true })
    targetEntityType: string;

    @Prop({ type: Types.ObjectId, required: true })
    targetEntityId: Types.ObjectId;

    @Prop()
    reason?: string;

    @Prop({ type: Object })
    metadata?: Record<string, unknown>;

}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ targetEntityType: 1, targetEntityId: 1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
