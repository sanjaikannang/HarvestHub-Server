import { CollectionMethod, ProductStatus, UnitOfMeasure } from 'src/utils/enum';

// Shared response shape for a single product — reused across the
// create/update/list/get/review controllers in this folder.
export class ProductSummary {
    id: string;
    farmerId: string;
    districtId: string;
    categoryId: string;
    subcategoryKey: string;
    name: string;
    description: string;
    images: string[];
    estimatedQuantity: number;
    unitOfMeasure: UnitOfMeasure;
    verifiedQuantity?: number;
    qualityGrade?: string;
    startingPrice: number;
    finalStartingPrice?: number;
    biddingDate: Date;
    biddingStartTime: Date;
    biddingEndTime: Date;
    collectionMethod: CollectionMethod;
    status: ProductStatus;
    rejectionReason?: string;
    changeRequestNotes?: string;
    inspectionId?: string;
}
