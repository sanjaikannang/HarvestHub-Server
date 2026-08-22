import { Types } from 'mongoose';
import { DeliveryStatus, InventoryStatus, NotificationType, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { PayoutService } from 'src/services/payout-service/payout.service';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { OrderGateway } from 'src/gateways/order.gateway';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { CollectionCenterInventoryRepositoryService } from 'src/repositories/collection-center-inventory-repository/collection-center-inventory.repository';
import { DeliveryPartnerProfileRepositoryService } from 'src/repositories/delivery-partner-profile-repository/delivery-partner-profile.repository';
import { OrderDocument } from 'src/schemas/Order/order.schema';

// Sequential lifecycle — a Delivery Partner can only ever advance one stage
// at a time, never skip ahead or move backwards (requirement.md's business
// rule: "An order cannot be marked Delivered without first passing through
// all prior statuses in order").
const DELIVERY_STATUS_SEQUENCE = [
    DeliveryStatus.ORDER_CONFIRMED,
    DeliveryStatus.PREPARING_FOR_DISPATCH,
    DeliveryStatus.PICKED_UP,
    DeliveryStatus.IN_TRANSIT,
    DeliveryStatus.OUT_FOR_DELIVERY,
    DeliveryStatus.DELIVERED,
];

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly districtService: DistrictService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly collectionCenterInventoryRepositoryService: CollectionCenterInventoryRepositoryService,
        private readonly deliveryPartnerProfileRepositoryService: DeliveryPartnerProfileRepositoryService,
        private readonly payoutService: PayoutService,
        private readonly notificationService: NotificationService,
        private readonly orderGateway: OrderGateway,
    ) { }


    // Get Order By Id API Endpoint (Buyer: own, Farmer: own, Delivery Partner:
    // own assignment, District Admin: own district, Super Admin: any)
    async getOrderByIdAPI(orderId: string, requestingUser: RequestingUser) {
        const order = await this.orderRepositoryService.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        await this.assertCanAccess(order, requestingUser);

        return this.toSummary(order);
    }


    // List My Orders API Endpoint — Buyer sees orders they placed, Farmer sees
    // orders on their own products, Delivery Partner sees orders assigned to them
    async listMyOrdersAPI(requestingUser: RequestingUser) {
        let orders: OrderDocument[];
        if (requestingUser.role === UserRole.FARMER) {
            orders = await this.orderRepositoryService.findByFarmerId(requestingUser.sub);
        } else if (requestingUser.role === UserRole.DELIVERY_PARTNER) {
            orders = await this.orderRepositoryService.findByDeliveryPartnerId(requestingUser.sub);
        } else {
            orders = await this.orderRepositoryService.findByBuyerId(requestingUser.sub);
        }

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


    // Update Order Status API Endpoint (Delivery Partner — own assigned order
    // only) — advances the delivery lifecycle exactly one stage at a time.
    // Picked Up marks the Collection Center stock Dispatched; Delivered
    // releases the farmer's payout and frees up the partner's active-order slot.
    async updateOrderStatusAPI(orderId: string, requestingUser: RequestingUser, newStatus: DeliveryStatus) {
        const order = await this.orderRepositoryService.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.deliveryPartnerId?.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You are not assigned to this order');
        }

        const currentIndex = DELIVERY_STATUS_SEQUENCE.indexOf(order.deliveryStatus);
        const newIndex = DELIVERY_STATUS_SEQUENCE.indexOf(newStatus);
        if (newIndex !== currentIndex + 1) {
            throw new BadRequestException(`Cannot move from ${order.deliveryStatus} to ${newStatus} — statuses must advance one stage at a time`);
        }

        const now = new Date();
        const updated = await this.orderRepositoryService.updateDeliveryStatus(orderId, newStatus, {
            status: newStatus,
            timestamp: now,
            updatedBy: requestingUser.sub,
        });
        if (!updated) {
            throw new NotFoundException('Order not found');
        }

        if (newStatus === DeliveryStatus.PICKED_UP) {
            const inventoryEntry = await this.collectionCenterInventoryRepositoryService.findByProductId(order.productId.toString());
            if (inventoryEntry && inventoryEntry.status === InventoryStatus.RESERVED_FOR_SALE) {
                await this.collectionCenterInventoryRepositoryService.updateStatus(
                    (inventoryEntry._id as Types.ObjectId).toString(),
                    InventoryStatus.DISPATCHED,
                    { dispatchedAt: now, deliveryPartnerId: new Types.ObjectId(requestingUser.sub) },
                );
            }
        }

        if (newStatus === DeliveryStatus.DELIVERED) {
            await this.payoutService.releaseForDeliveredOrderAPI(orderId);
            await this.deliveryPartnerProfileRepositoryService.decrementActiveOrderCount(requestingUser.sub);
        }

        const summary = this.toSummary(updated);
        this.orderGateway.emitStatusUpdated(orderId, { orderId, deliveryStatus: newStatus, timestamp: now });

        const product = await this.productRepositoryService.findById(order.productId.toString());
        if (product) {
            await this.notificationService.notifyAPI(
                order.buyerId.toString(),
                NotificationType.ORDER_STATUS_CHANGE,
                { productName: product.name, status: newStatus.replace(/_/g, ' ') },
                { type: 'order', id: orderId },
            );
        }

        return summary;
    }


    // Assign Delivery Partner API Endpoint (Super Admin, District Admin — own
    // district only) — the manual fallback for requirement.md's "if no
    // Delivery Partner is available... the District Admin is notified for
    // manual intervention", and for reassignment.
    async assignDeliveryPartnerManuallyAPI(orderId: string, deliveryPartnerId: string, requestingUser: RequestingUser) {
        const order = await this.orderRepositoryService.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, order.districtId.toString());
        }

        const deliveryPartner = await this.userRepositoryService.findById(deliveryPartnerId);
        if (!deliveryPartner || deliveryPartner.role !== UserRole.DELIVERY_PARTNER) {
            throw new BadRequestException('Only a user with the DELIVERY_PARTNER role can be assigned');
        }

        const profile = await this.deliveryPartnerProfileRepositoryService.findByUserId(deliveryPartnerId);
        if (!profile || !profile.districtsServiced.some((id) => id.toString() === order.districtId.toString())) {
            throw new BadRequestException('This delivery partner does not service the order\'s district');
        }

        const previousPartnerId = order.deliveryPartnerId?.toString();
        if (previousPartnerId === deliveryPartnerId) {
            return this.toSummary(order);
        }

        const updated = await this.orderRepositoryService.assignDeliveryPartner(orderId, deliveryPartnerId);
        await this.deliveryPartnerProfileRepositoryService.incrementActiveOrderCount(deliveryPartnerId);
        if (previousPartnerId) {
            await this.deliveryPartnerProfileRepositoryService.decrementActiveOrderCount(previousPartnerId);
        }

        return this.toSummary(updated!);
    }


    private async assertCanAccess(order: OrderDocument, requestingUser: RequestingUser): Promise<void> {
        if (requestingUser.role === UserRole.BUYER && order.buyerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this order');
        }

        if (requestingUser.role === UserRole.FARMER && order.farmerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this order');
        }

        if (requestingUser.role === UserRole.DELIVERY_PARTNER && order.deliveryPartnerId?.toString() !== requestingUser.sub) {
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
