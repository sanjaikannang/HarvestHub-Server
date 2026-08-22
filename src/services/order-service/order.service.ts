import { Types } from 'mongoose';
import { UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { OrderDocument } from 'src/schemas/Order/order.schema';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly districtService: DistrictService,
    ) { }


    // Get Order By Id API Endpoint (Buyer: own, Farmer: own, District Admin:
    // own district, Super Admin: any)
    async getOrderByIdAPI(orderId: string, requestingUser: RequestingUser) {
        const order = await this.orderRepositoryService.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        await this.assertCanAccess(order, requestingUser);

        return this.toSummary(order);
    }


    // List My Orders API Endpoint — Buyer sees orders they placed, Farmer
    // sees orders on their own products
    async listMyOrdersAPI(requestingUser: RequestingUser) {
        const orders = requestingUser.role === UserRole.FARMER
            ? await this.orderRepositoryService.findByFarmerId(requestingUser.sub)
            : await this.orderRepositoryService.findByBuyerId(requestingUser.sub);

        return orders.map((order) => this.toSummary(order));
    }


    // List Orders API Endpoint (District Admin: own district only, Super
    // Admin: all or filtered by districtId) — oversight, per requirement.md
    async listOrdersAPI(requestingUser: RequestingUser, filters: { districtId?: string }) {
        let districtId = filters.districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                districtId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const orders = await this.orderRepositoryService.findAll({ districtId });
        return orders.map((order) => this.toSummary(order));
    }


    private async assertCanAccess(order: OrderDocument, requestingUser: RequestingUser): Promise<void> {
        if (requestingUser.role === UserRole.BUYER && order.buyerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this order');
        }

        if (requestingUser.role === UserRole.FARMER && order.farmerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this order');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, order.districtId.toString());
        }
    }


    private toSummary(order: OrderDocument) {
        return {
            id: (order._id as Types.ObjectId).toString(),
            productId: order.productId.toString(),
            sessionId: order.sessionId.toString(),
            paymentId: order.paymentId.toString(),
            buyerId: order.buyerId.toString(),
            farmerId: order.farmerId.toString(),
            districtId: order.districtId.toString(),
            winningBidAmount: order.winningBidAmount,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            deliveryPartnerId: order.deliveryPartnerId?.toString(),
            deliveryStatus: order.deliveryStatus,
            deliveryStatusHistory: order.deliveryStatusHistory,
        };
    }

}
