import { Types } from 'mongoose';
import { NotificationChannel, NotificationType, PayoutStatus, UserRole } from 'src/utils/enum';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { PayoutRepositoryService } from 'src/repositories/payout-repository/payout.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { PayoutDocument } from 'src/schemas/Payout/payout.schema';

@Injectable()
export class PayoutService {
    private readonly logger = new Logger(PayoutService.name);

    constructor(
        private readonly payoutRepositoryService: PayoutRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly districtService: DistrictService,
        private readonly notificationService: NotificationService,
    ) { }


    // List My Payouts API Endpoint (Farmer)
    async listMyPayoutsAPI(farmerId: string) {
        const payouts = await this.payoutRepositoryService.findByFarmerId(farmerId);
        return payouts.map((payout) => this.toSummary(payout));
    }


    // List Payouts API Endpoint (District Admin: own district's orders only,
    // Super Admin: all or filtered by districtId) — oversight, per requirement.md
    async listPayoutsAPI(requestingUser: RequestingUser, filters: { districtId?: string }) {
        let districtId = filters.districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                districtId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const orders = await this.orderRepositoryService.findAll({ districtId });
        const payouts = await this.payoutRepositoryService.findByOrderIds(orders.map((order) => (order._id as Types.ObjectId).toString()));
        return payouts.map((payout) => this.toSummary(payout));
    }


    // Release Payout API Endpoint (Super Admin, District Admin — own district
    // only) — a manual admin action until Order & Delivery Management (08)
    // exists to trigger it automatically on delivery confirmation, per
    // requirement.md's "no payout before delivery confirmation" business rule.
    async releasePayoutAPI(payoutId: string, requestingUser: RequestingUser) {
        const payout = await this.payoutRepositoryService.findById(payoutId);
        if (!payout) {
            throw new NotFoundException('Payout not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            const order = await this.orderRepositoryService.findById(payout.orderId.toString());
            if (!order) {
                throw new NotFoundException('Order not found for this payout');
            }
            await this.districtService.assertOwnDistrict(requestingUser.sub, order.districtId.toString());
        }

        if (payout.status !== PayoutStatus.PENDING) {
            throw new BadRequestException('Only a pending payout can be released');
        }

        const updated = await this.payoutRepositoryService.release(payoutId);
        await this.notifyPayoutReleased(updated!);
        return this.toSummary(updated!);
    }


    // Releases the payout tied to an order the moment it's marked Delivered —
    // called by OrderService.updateOrderStatusAPI, not user-facing (requirement.md:
    // "No payout is released before delivery confirmation"). Idempotent no-op
    // if there's no payout yet or it's already past pending.
    async releaseForDeliveredOrderAPI(orderId: string): Promise<void> {
        const payout = await this.payoutRepositoryService.findByOrderId(orderId);
        if (!payout) {
            this.logger.warn(`No payout found for delivered order ${orderId}`);
            return;
        }
        if (payout.status !== PayoutStatus.PENDING) {
            return;
        }

        const updated = await this.payoutRepositoryService.release((payout._id as Types.ObjectId).toString());
        await this.notifyPayoutReleased(updated!);
    }


    private async notifyPayoutReleased(payout: PayoutDocument): Promise<void> {
        const order = await this.orderRepositoryService.findById(payout.orderId.toString());
        const product = order ? await this.productRepositoryService.findById(order.productId.toString()) : null;
        if (!product) {
            return;
        }

        await this.notificationService.notifyAPI(
            payout.farmerId.toString(),
            NotificationType.PAYOUT_RELEASED,
            { productName: product.name, amount: String(payout.netPayoutAmount) },
            { type: 'payout', id: (payout._id as Types.ObjectId).toString() },
            [NotificationChannel.IN_APP, NotificationChannel.SMS],
        );
    }


    private toSummary(payout: PayoutDocument) {
        return {
            id: (payout._id as Types.ObjectId).toString(),
            orderId: payout.orderId.toString(),
            farmerId: payout.farmerId.toString(),
            grossAmount: payout.grossAmount,
            commissionPercentage: payout.commissionPercentage,
            commissionAmount: payout.commissionAmount,
            netPayoutAmount: payout.netPayoutAmount,
            status: payout.status,
            holdReason: payout.holdReason,
            releasedAt: payout.releasedAt,
        };
    }

}
