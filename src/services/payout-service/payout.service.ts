import { Types } from 'mongoose';
import { PayoutStatus, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { PayoutRepositoryService } from 'src/repositories/payout-repository/payout.repository';
import { PayoutDocument } from 'src/schemas/Payout/payout.schema';

@Injectable()
export class PayoutService {
    constructor(
        private readonly payoutRepositoryService: PayoutRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly districtService: DistrictService,
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
        return this.toSummary(updated!);
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
