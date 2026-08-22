import { Types } from 'mongoose';
import { DeliveryStatus, DisputeReason, DisputeStatus, NotificationType, PayoutStatus, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { PayoutRepositoryService } from 'src/repositories/payout-repository/payout.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { DisputeRepositoryService } from 'src/repositories/dispute-repository/dispute.repository';
import { DisputeDocument } from 'src/schemas/Dispute/dispute.schema';
import { OrderDocument } from 'src/schemas/Order/order.schema';

const RAISE_WINDOW_HOURS = 48;

export interface RaiseDisputeData {
    orderId: string;
    reason: DisputeReason;
    description: string;
    photos?: string[];
}

export interface ResolveDisputeData {
    outcome: 'reject' | 'refund' | 'escalate';
    resolutionNotes: string;
    refundAmount?: number;
}

@Injectable()
export class DisputeService {
    constructor(
        private readonly disputeRepositoryService: DisputeRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly payoutRepositoryService: PayoutRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly districtService: DistrictService,
        private readonly notificationService: NotificationService,
    ) { }


    // Raise Dispute API Endpoint (Buyer — own delivered order only)
    async raiseDisputeAPI(buyerId: string, data: RaiseDisputeData) {
        const order = await this.orderRepositoryService.findById(data.orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.buyerId.toString() !== buyerId) {
            throw new ForbiddenException('You do not have access to this order');
        }
        if (order.deliveryStatus !== DeliveryStatus.DELIVERED) {
            throw new BadRequestException('A dispute can only be raised against a delivered order');
        }

        const deliveredAt = (order as any).updatedAt as Date;
        const hoursSinceDelivery = (Date.now() - deliveredAt.getTime()) / (60 * 60 * 1000);
        if (hoursSinceDelivery > RAISE_WINDOW_HOURS) {
            throw new BadRequestException(`The window to raise a dispute (${RAISE_WINDOW_HOURS} hours after delivery) has passed`);
        }

        const existing = await this.disputeRepositoryService.findByOrderId(data.orderId);
        if (existing) {
            throw new BadRequestException('A dispute has already been raised for this order');
        }

        const now = new Date();
        const dispute = await this.disputeRepositoryService.create({
            orderId: order._id as Types.ObjectId,
            buyerId: new Types.ObjectId(buyerId),
            reason: data.reason,
            description: data.description,
            photos: data.photos ?? [],
            status: DisputeStatus.RAISED,
            raisedAt: now,
        });

        const product = await this.productRepositoryService.findById(order.productId.toString());
        const districtAdminId = await this.districtService.getDistrictAdminUserId(order.districtId.toString());
        if (product && districtAdminId) {
            await this.notificationService.notifyAPI(
                districtAdminId,
                NotificationType.DISPUTE_RAISED,
                { productName: product.name, reason: data.reason.replace(/_/g, ' ') },
                { type: 'dispute', id: (dispute._id as Types.ObjectId).toString() },
            );
        }

        return this.toSummary(dispute);
    }


    // Start Review API Endpoint (District Admin — own district, Super Admin — any)
    async startReviewAPI(disputeId: string, requestingUser: RequestingUser) {
        const { dispute } = await this.getScopedDispute(disputeId, requestingUser);

        if (dispute.status !== DisputeStatus.RAISED) {
            throw new BadRequestException('Only a newly-raised dispute can move to review');
        }

        const updated = await this.disputeRepositoryService.updateStatus(disputeId, DisputeStatus.UNDER_REVIEW);
        return this.toSummary(updated!);
    }


    // Resolve Dispute API Endpoint (District Admin — own district, Super
    // Admin — any) — reject, approve a refund (adjusting/reversing the
    // farmer's payout), or escalate to Super Admin, per requirement.md
    async resolveDisputeAPI(disputeId: string, requestingUser: RequestingUser, data: ResolveDisputeData) {
        const { dispute, order } = await this.getScopedDispute(disputeId, requestingUser);

        if (dispute.status === DisputeStatus.RESOLVED_REFUND || dispute.status === DisputeStatus.RESOLVED_REJECTED) {
            throw new BadRequestException('This dispute has already been resolved');
        }

        const now = new Date();

        if (data.outcome === 'escalate') {
            if (requestingUser.role !== UserRole.DISTRICT_ADMIN) {
                throw new BadRequestException('Super Admin is the final escalation point and cannot escalate further');
            }

            const updated = await this.disputeRepositoryService.updateStatus(disputeId, DisputeStatus.ESCALATED, {
                resolutionNotes: data.resolutionNotes,
            });

            const product = await this.productRepositoryService.findById(order.productId.toString());
            const superAdmins = await this.userRepositoryService.findByRoleAndDistrict(UserRole.SUPER_ADMIN);
            for (const superAdmin of superAdmins) {
                await this.notificationService.notifyAPI(
                    (superAdmin._id as Types.ObjectId).toString(),
                    NotificationType.DISPUTE_ESCALATED,
                    { productName: product?.name ?? '' },
                    { type: 'dispute', id: disputeId },
                );
            }
            await this.notifyBuyerStatusUpdate(order, disputeId, DisputeStatus.ESCALATED);

            return this.toSummary(updated!);
        }

        if (data.outcome === 'refund') {
            if (!data.refundAmount || data.refundAmount <= 0) {
                throw new BadRequestException('A positive refund amount is required');
            }

            const payout = await this.payoutRepositoryService.findByOrderId((order._id as Types.ObjectId).toString());
            if (!payout) {
                throw new NotFoundException('Payout not found for this order');
            }
            if (payout.status === PayoutStatus.REVERSED) {
                throw new BadRequestException('This payout has already been fully reversed');
            }
            if (data.refundAmount > payout.grossAmount) {
                throw new BadRequestException('Refund cannot exceed the order amount');
            }

            if (data.refundAmount >= payout.netPayoutAmount) {
                await this.payoutRepositoryService.reverse((payout._id as Types.ObjectId).toString(), data.resolutionNotes);
            } else {
                await this.payoutRepositoryService.adjustNetAmount(
                    (payout._id as Types.ObjectId).toString(),
                    payout.netPayoutAmount - data.refundAmount,
                    data.resolutionNotes,
                );
            }

            const updated = await this.disputeRepositoryService.updateStatus(disputeId, DisputeStatus.RESOLVED_REFUND, {
                resolvedBy: new Types.ObjectId(requestingUser.sub),
                resolutionNotes: data.resolutionNotes,
                refundAmount: data.refundAmount,
                resolvedAt: now,
            });

            await this.notifyBuyerStatusUpdate(order, disputeId, DisputeStatus.RESOLVED_REFUND);
            return this.toSummary(updated!);
        }

        // outcome === 'reject'
        const updated = await this.disputeRepositoryService.updateStatus(disputeId, DisputeStatus.RESOLVED_REJECTED, {
            resolvedBy: new Types.ObjectId(requestingUser.sub),
            resolutionNotes: data.resolutionNotes,
            resolvedAt: now,
        });

        await this.notifyBuyerStatusUpdate(order, disputeId, DisputeStatus.RESOLVED_REJECTED);
        return this.toSummary(updated!);
    }


    // Get Dispute By Id API Endpoint (Buyer: own, District Admin: own
    // district, Super Admin: any)
    async getDisputeByIdAPI(disputeId: string, requestingUser: RequestingUser) {
        const { dispute } = await this.getScopedDispute(disputeId, requestingUser);
        return this.toSummary(dispute);
    }


    // List My Disputes API Endpoint (Buyer)
    async listMyDisputesAPI(buyerId: string) {
        const disputes = await this.disputeRepositoryService.findByBuyerId(buyerId);
        return disputes.map((dispute) => this.toSummary(dispute));
    }


    // List Disputes API Endpoint (District Admin: own district only, Super
    // Admin: all or filtered by districtId) — oversight, per requirement.md
    async listDisputesAPI(requestingUser: RequestingUser, filters: { districtId?: string; status?: DisputeStatus }) {
        let districtId = filters.districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                districtId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const orders = await this.orderRepositoryService.findAll({ districtId });
        const disputes = await this.disputeRepositoryService.findByOrderIds(orders.map((order) => (order._id as Types.ObjectId).toString()), filters.status);
        return disputes.map((dispute) => this.toSummary(dispute));
    }


    private async notifyBuyerStatusUpdate(order: OrderDocument, disputeId: string, status: DisputeStatus): Promise<void> {
        const product = await this.productRepositoryService.findById(order.productId.toString());
        if (!product) {
            return;
        }
        await this.notificationService.notifyAPI(
            order.buyerId.toString(),
            NotificationType.DISPUTE_STATUS_UPDATE,
            { productName: product.name, status: status.replace(/_/g, ' ') },
            { type: 'dispute', id: disputeId },
        );
    }


    private async getScopedDispute(disputeId: string, requestingUser: RequestingUser): Promise<{ dispute: DisputeDocument; order: OrderDocument }> {
        const dispute = await this.disputeRepositoryService.findById(disputeId);
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        const order = await this.orderRepositoryService.findById(dispute.orderId.toString());
        if (!order) {
            throw new NotFoundException('Order not found for this dispute');
        }

        if (requestingUser.role === UserRole.BUYER && dispute.buyerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this dispute');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, order.districtId.toString());
        }

        return { dispute, order };
    }


    private toSummary(dispute: DisputeDocument) {
        return {
            id: (dispute._id as Types.ObjectId).toString(),
            orderId: dispute.orderId.toString(),
            buyerId: dispute.buyerId.toString(),
            reason: dispute.reason,
            description: dispute.description,
            photos: dispute.photos,
            status: dispute.status,
            resolvedBy: dispute.resolvedBy?.toString(),
            resolutionNotes: dispute.resolutionNotes,
            refundAmount: dispute.refundAmount,
            raisedAt: dispute.raisedAt,
            resolvedAt: dispute.resolvedAt,
        };
    }

}
