import { Types } from 'mongoose';
import { AdminDecision, CollectionMethod, InventoryStatus, ProductStatus, RecommendedVerdict, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { InspectionRepositoryService } from 'src/repositories/inspection-repository/inspection.repository';
import { CollectionCenterRepositoryService } from 'src/repositories/collection-center-repository/collection-center.repository';
import { CollectionCenterInventoryRepositoryService } from 'src/repositories/collection-center-inventory-repository/collection-center-inventory.repository';
import { Inspection, InspectionDocument } from 'src/schemas/Inspection/inspection.schema';

// Statuses a product must be in before an inspection can be scheduled against it
const SCHEDULABLE_PRODUCT_STATUSES = [ProductStatus.SUBMITTED, ProductStatus.UNDER_REVIEW];

export interface ScheduleInspectionData {
    productId: string;
    inspectorId: string;
    collectionMethod: CollectionMethod;
    scheduledDate: Date;
    scheduledSlot: string;
}

export interface RecordFindingsData {
    verifiedQuantity: number;
    qualityGrade: string;
    conditionNotes?: string;
    inspectionPhotos?: string[];
    recommendedVerdict: RecommendedVerdict;
}

export interface DecideData {
    reason?: string;
    collectionCenterId?: string;
}

@Injectable()
export class InspectionService {
    constructor(
        private readonly inspectionRepositoryService: InspectionRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly districtService: DistrictService,
        private readonly collectionCenterRepositoryService: CollectionCenterRepositoryService,
        private readonly collectionCenterInventoryRepositoryService: CollectionCenterInventoryRepositoryService,
    ) { }


    // Schedule Inspection API Endpoint (Super Admin, District Admin — own district only)
    async scheduleInspectionAPI(data: ScheduleInspectionData, requestingUser: RequestingUser) {
        const product = await this.productRepositoryService.findById(data.productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, product.districtId.toString());
        }

        if (!SCHEDULABLE_PRODUCT_STATUSES.includes(product.status)) {
            throw new BadRequestException('An inspection can only be scheduled while a product is submitted or under review');
        }

        const inspector = await this.userRepositoryService.findById(data.inspectorId);
        if (!inspector) {
            throw new NotFoundException('Inspector not found');
        }
        if (inspector.role !== UserRole.INSPECTOR) {
            throw new BadRequestException('Only a user with the INSPECTOR role can be assigned to an inspection');
        }
        // Business rule: an Inspector can only be assigned within their own district
        if (inspector.districtId?.toString() !== product.districtId.toString()) {
            throw new BadRequestException('The inspector must belong to the same district as the product');
        }

        const inspection = await this.inspectionRepositoryService.create({
            productId: product._id as Types.ObjectId,
            districtId: product.districtId,
            inspectorId: new Types.ObjectId(data.inspectorId),
            collectionMethod: data.collectionMethod,
            scheduledDate: data.scheduledDate,
            scheduledSlot: data.scheduledSlot,
        });

        await this.productRepositoryService.updateDetails(data.productId, {
            status: ProductStatus.INSPECTION_SCHEDULED,
            inspectionId: inspection._id as Types.ObjectId,
        });

        return this.toSummary(inspection);
    }


    // Record Findings API Endpoint (Inspector — own assigned inspection only)
    async recordFindingsAPI(inspectionId: string, data: RecordFindingsData, requestingUser: RequestingUser) {
        const inspection = await this.inspectionRepositoryService.findById(inspectionId);
        if (!inspection) {
            throw new NotFoundException('Inspection not found');
        }

        if (inspection.inspectorId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You are not the inspector assigned to this inspection');
        }

        if (inspection.visitedAt) {
            throw new BadRequestException('Findings have already been recorded for this inspection');
        }

        const updated = await this.inspectionRepositoryService.recordFindings(inspectionId, data);

        await this.productRepositoryService.updateDetails(inspection.productId.toString(), {
            status: ProductStatus.INSPECTED,
        });

        return this.toSummary(updated!);
    }


    // Decide API Endpoint (Super Admin, District Admin — own district only) —
    // the final approve/reject/request-changes call, per requirement.md
    async decideAPI(inspectionId: string, decision: AdminDecision, data: DecideData, requestingUser: RequestingUser) {
        const inspection = await this.inspectionRepositoryService.findById(inspectionId);
        if (!inspection) {
            throw new NotFoundException('Inspection not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, inspection.districtId.toString());
        }

        // Business rule: a product cannot be Approved without a completed
        // Inspection record — extended here to every decision, since the
        // decision is described as happening after reviewing the inspector's report
        if (!inspection.visitedAt) {
            throw new BadRequestException('Cannot decide before the inspector records findings');
        }

        if (inspection.adminDecision) {
            throw new BadRequestException('This inspection has already been decided');
        }

        if ((decision === AdminDecision.REJECTED || decision === AdminDecision.CHANGES_REQUESTED) && !data.reason) {
            throw new BadRequestException('A reason is required for this decision');
        }

        let collectionCenterId: Types.ObjectId | undefined;
        if (decision === AdminDecision.APPROVED) {
            if (!data.collectionCenterId) {
                throw new BadRequestException('A collection center is required to approve a product');
            }

            const collectionCenter = await this.collectionCenterRepositoryService.findById(data.collectionCenterId);
            if (!collectionCenter) {
                throw new NotFoundException('Collection center not found');
            }
            if (collectionCenter.districtId.toString() !== inspection.districtId.toString()) {
                throw new BadRequestException('The collection center must belong to the same district as the inspection');
            }
            if (!collectionCenter.isActive) {
                throw new BadRequestException('Cannot receive goods at an inactive collection center');
            }

            collectionCenterId = collectionCenter._id as Types.ObjectId;
        }

        const updated = await this.inspectionRepositoryService.recordDecision(inspectionId, decision, requestingUser.sub, data.reason);
        const productId = inspection.productId.toString();

        if (decision === AdminDecision.APPROVED) {
            // Goes straight to Listed, not just Approved — by the time inventory is
            // logged below (in the same call), the only gate on Listed ("goods
            // received, in_storage" — database/collection-center-inventory.md) is
            // already satisfied, so there's no separate waiting step in between.
            await this.productRepositoryService.updateDetails(productId, {
                status: ProductStatus.LISTED,
                verifiedQuantity: inspection.verifiedQuantity,
                qualityGrade: inspection.qualityGrade,
                finalStartingPrice: (await this.productRepositoryService.findById(productId))!.startingPrice,
            });

            await this.collectionCenterInventoryRepositoryService.create({
                collectionCenterId,
                productId: inspection.productId,
                receivedQuantity: inspection.verifiedQuantity,
                receivedDate: new Date(),
                status: InventoryStatus.IN_STORAGE,
            });
        } else if (decision === AdminDecision.REJECTED) {
            await this.productRepositoryService.updateStatus(productId, ProductStatus.REJECTED, { rejectionReason: data.reason });
        } else {
            await this.productRepositoryService.updateStatus(productId, ProductStatus.CHANGES_REQUESTED, { changeRequestNotes: data.reason });
        }

        return this.toSummary(updated!);
    }


    // Get Inspection By Id API Endpoint (Super Admin: any, District Admin: own
    // district, Inspector: own assignment)
    async getInspectionByIdAPI(inspectionId: string, requestingUser: RequestingUser) {
        const inspection = await this.inspectionRepositoryService.findById(inspectionId);
        if (!inspection) {
            throw new NotFoundException('Inspection not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, inspection.districtId.toString());
        } else if (requestingUser.role === UserRole.INSPECTOR && inspection.inspectorId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this inspection');
        }

        return this.toSummary(inspection);
    }


    // List Inspections API Endpoint (Super Admin: all or by districtId,
    // District Admin: own district only) — the review queue
    async listInspectionsAPI(requestingUser: RequestingUser, districtId?: string) {
        let scopedDistrictId = districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                scopedDistrictId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const inspections = await this.inspectionRepositoryService.findAll({ districtId: scopedDistrictId });
        return inspections.map((inspection) => this.toSummary(inspection));
    }


    // List My Inspections API Endpoint (Inspector — their assigned visits)
    async listMyInspectionsAPI(inspectorUserId: string) {
        const inspections = await this.inspectionRepositoryService.findByInspectorId(inspectorUserId);
        return inspections.map((inspection) => this.toSummary(inspection));
    }


    private toSummary(inspection: InspectionDocument) {
        const stage = inspection.adminDecision ? 'decided' : inspection.visitedAt ? 'awaiting_decision' : 'scheduled';

        return {
            id: (inspection._id as Types.ObjectId).toString(),
            productId: inspection.productId.toString(),
            districtId: inspection.districtId.toString(),
            inspectorId: inspection.inspectorId.toString(),
            collectionMethod: inspection.collectionMethod,
            scheduledDate: inspection.scheduledDate,
            scheduledSlot: inspection.scheduledSlot,
            visitedAt: inspection.visitedAt,
            verifiedQuantity: inspection.verifiedQuantity,
            qualityGrade: inspection.qualityGrade,
            conditionNotes: inspection.conditionNotes,
            inspectionPhotos: inspection.inspectionPhotos,
            recommendedVerdict: inspection.recommendedVerdict,
            adminDecision: inspection.adminDecision,
            adminDecisionReason: inspection.adminDecisionReason,
            decidedBy: inspection.decidedBy?.toString(),
            decidedAt: inspection.decidedAt,
            stage,
        };
    }

}
