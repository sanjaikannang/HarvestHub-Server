import { AdminDecision, CollectionMethod, RecommendedVerdict } from 'src/utils/enum';

// Shared response shape for a single inspection — reused across the
// schedule/list/get/findings/decision controllers in this folder.
export class InspectionSummary {
    id: string;
    productId: string;
    districtId: string;
    inspectorId: string;
    collectionMethod: CollectionMethod;
    scheduledDate: Date;
    scheduledSlot: string;
    visitedAt?: Date;
    verifiedQuantity?: number;
    qualityGrade?: string;
    conditionNotes?: string;
    inspectionPhotos?: string[];
    recommendedVerdict?: RecommendedVerdict;
    adminDecision?: AdminDecision;
    adminDecisionReason?: string;
    decidedBy?: string;
    decidedAt?: Date;
    // Derived, not stored — 'scheduled' | 'awaiting_decision' | 'decided'
    stage: string;
}
