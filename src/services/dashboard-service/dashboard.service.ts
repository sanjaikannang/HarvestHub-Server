import { Types } from 'mongoose';
import { BiddingSessionStatus, DeliveryStatus, DisputeStatus, ProductStatus, UserRole } from 'src/utils/enum';
import { Injectable } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { PayoutRepositoryService } from 'src/repositories/payout-repository/payout.repository';
import { DisputeRepositoryService } from 'src/repositories/dispute-repository/dispute.repository';
import { InspectionRepositoryService } from 'src/repositories/inspection-repository/inspection.repository';
import { BiddingSessionRepositoryService } from 'src/repositories/bidding-session-repository/bidding-session.repository';
import { AuditLogRepositoryService } from 'src/repositories/audit-log-repository/audit-log.repository';
import { AuditLogDocument } from 'src/schemas/AuditLog/audit-log.schema';

// Product statuses still moving through submission/review/inspection/bidding
// — "pending review" is a narrower slice of this (see getDistrictAdminDashboardAPI)
const REVIEWABLE_PRODUCT_STATUSES = [ProductStatus.SUBMITTED, ProductStatus.UNDER_REVIEW];
const OPEN_DISPUTE_STATUSES = [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED];

@Injectable()
export class DashboardService {
    constructor(
        private readonly districtService: DistrictService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly payoutRepositoryService: PayoutRepositoryService,
        private readonly disputeRepositoryService: DisputeRepositoryService,
        private readonly inspectionRepositoryService: InspectionRepositoryService,
        private readonly biddingSessionRepositoryService: BiddingSessionRepositoryService,
        private readonly auditLogRepositoryService: AuditLogRepositoryService,
    ) { }


    // Super Admin Dashboard API Endpoint — platform-wide view, per requirement.md
    async getSuperAdminDashboardAPI() {
        const [districts, totalFarmers, totalBuyers, totalProducts, totalOrders, totalRevenue, totalCommission, pendingEscalations] = await Promise.all([
            this.districtService.getDistrictDirectoryAPI(),
            this.userRepositoryService.countByRole(UserRole.FARMER),
            this.userRepositoryService.countByRole(UserRole.BUYER),
            this.productRepositoryService.countAll(),
            this.orderRepositoryService.countAll(),
            this.orderRepositoryService.getTotalRevenue(),
            this.payoutRepositoryService.getTotalCommission(),
            this.disputeRepositoryService.countByStatus(DisputeStatus.ESCALATED),
        ]);

        return {
            districts,
            totalFarmers,
            totalBuyers,
            totalProducts,
            totalOrders,
            totalRevenue,
            totalCommission,
            pendingEscalations,
        };
    }


    // District Admin Dashboard API Endpoint — always the caller's own
    // district, per requirement.md's business rule
    async getDistrictAdminDashboardAPI(districtAdminUserId: string) {
        const districtId = await this.districtService.resolveDistrictAdminDistrictId(districtAdminUserId);

        const [products, inspections, liveSessions, orders] = await Promise.all([
            this.productRepositoryService.findAll({ districtId }),
            this.inspectionRepositoryService.findAll({ districtId }),
            this.biddingSessionRepositoryService.findByStatus(BiddingSessionStatus.LIVE),
            this.orderRepositoryService.findAll({ districtId }),
        ]);

        // BiddingSession doesn't carry districtId directly — cross-reference
        // against this district's own product ids instead
        const productIds = new Set(products.map((product) => (product._id as Types.ObjectId).toString()));
        const activeBiddingSessions = liveSessions.filter((session) => productIds.has(session.productId.toString())).length;

        const disputes = await this.disputeRepositoryService.findByOrderIds(orders.map((order) => (order._id as Types.ObjectId).toString()));

        return {
            districtId,
            pendingProductReviews: products.filter((product) => REVIEWABLE_PRODUCT_STATUSES.includes(product.status)).length,
            pendingInspections: inspections.filter((inspection) => !inspection.adminDecision).length,
            activeBiddingSessions,
            ordersInProgress: orders.filter((order) => order.deliveryStatus !== DeliveryStatus.DELIVERED).length,
            openDisputes: disputes.filter((dispute) => OPEN_DISPUTE_STATUSES.includes(dispute.status)).length,
            totalDisputes: disputes.length,
        };
    }


    // Audit Log View API Endpoint (District Admin: own district only, Super
    // Admin: all or filtered by districtId) — compliance/dispute reference,
    // per requirement.md
    async listAuditLogsAPI(requestingUser: RequestingUser, filters: { districtId?: string }) {
        let districtId = filters.districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                districtId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const entries = await this.auditLogRepositoryService.findAll({ districtId });
        return entries.map((entry) => this.toAuditLogSummary(entry));
    }


    private toAuditLogSummary(entry: AuditLogDocument) {
        return {
            id: (entry._id as Types.ObjectId).toString(),
            actorId: entry.actorId.toString(),
            actorRole: entry.actorRole,
            action: entry.action,
            targetEntityType: entry.targetEntityType,
            targetEntityId: entry.targetEntityId.toString(),
            reason: entry.reason,
            metadata: entry.metadata,
            districtId: entry.districtId?.toString(),
            createdAt: (entry as any).createdAt,
        };
    }

}
