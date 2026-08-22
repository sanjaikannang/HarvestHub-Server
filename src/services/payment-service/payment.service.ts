import { Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliveryStatus, InventoryStatus, NotificationType, PaymentStatus, PayoutStatus, ProductStatus } from 'src/utils/enum';
import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PaymentGatewayService } from 'src/services/payment-gateway-service/payment-gateway.service';
import { DistrictService } from 'src/services/district-service/district.service';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { BidRepositoryService } from 'src/repositories/bid-repository/bid.repository';
import { PaymentRepositoryService } from 'src/repositories/payment-repository/payment.repository';
import { OrderRepositoryService } from 'src/repositories/order-repository/order.repository';
import { PayoutRepositoryService } from 'src/repositories/payout-repository/payout.repository';
import { PlatformSettingsRepositoryService } from 'src/repositories/platform-settings-repository/platform-settings.repository';
import { CollectionCenterInventoryRepositoryService } from 'src/repositories/collection-center-inventory-repository/collection-center-inventory.repository';
import { DeliveryPartnerProfileRepositoryService } from 'src/repositories/delivery-partner-profile-repository/delivery-partner-profile.repository';
import { Payment, PaymentDocument } from 'src/schemas/Payment/payment.schema';
import { OrderDocument } from 'src/schemas/Order/order.schema';
import { DeliveryAddress } from 'src/schemas/DeliveryAddress/delivery-address.schema';

const PAYMENT_WINDOW_MINUTES = 15;

export interface VerifyPaymentData {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly paymentRepositoryService: PaymentRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly payoutRepositoryService: PayoutRepositoryService,
        private readonly platformSettingsRepositoryService: PlatformSettingsRepositoryService,
        private readonly bidRepositoryService: BidRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly paymentGatewayService: PaymentGatewayService,
        private readonly collectionCenterInventoryRepositoryService: CollectionCenterInventoryRepositoryService,
        private readonly deliveryPartnerProfileRepositoryService: DeliveryPartnerProfileRepositoryService,
        private readonly districtService: DistrictService,
        private readonly notificationService: NotificationService,
    ) { }


    // Opens the first payment window for a session's winner — called by
    // BiddingService the moment a session closes Sold (requirement.md: "the
    // buyer is given a 10-15 minute window to complete payment").
    async openPaymentWindowAPI(sessionId: string, productId: string, buyerId: string, perUnitAmount: number, quantity: number): Promise<void> {
        await this.createPaymentAttempt(new Types.ObjectId(sessionId), new Types.ObjectId(productId), new Types.ObjectId(buyerId), perUnitAmount * quantity);
    }


    // Checkout API Endpoint (Buyer — must be the payment's current buyer) —
    // creates the actual Razorpay order and captures the delivery address up
    // front, so both the buyer's own verify call and an out-of-order webhook
    // have what they need to create the Order (see completePaymentSuccess).
    async checkoutAPI(paymentId: string, buyerId: string, deliveryAddress: DeliveryAddress) {
        const payment = await this.getOwnedPayment(paymentId, buyerId);

        if (payment.status === PaymentStatus.EXPIRED || payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.SUCCESSFUL) {
            throw new BadRequestException('This payment window is no longer open');
        }

        if (payment.status === PaymentStatus.PROCESSING && payment.razorpayOrderId) {
            // Idempotent — buyer reloaded the checkout page; don't create a
            // second Razorpay order for the same attempt
            return this.toCheckoutSummary(payment);
        }

        const razorpayOrder = await this.paymentGatewayService.createOrder(Math.round(payment.amount * 100), paymentId);
        const updated = await this.paymentRepositoryService.markProcessing(paymentId, razorpayOrder.id, deliveryAddress);
        return this.toCheckoutSummary(updated!);
    }


    // Verify API Endpoint (Buyer) — called by the client immediately after
    // Razorpay Checkout reports success in the browser
    async verifyPaymentAPI(paymentId: string, buyerId: string, data: VerifyPaymentData) {
        const payment = await this.getOwnedPayment(paymentId, buyerId);

        if (payment.status !== PaymentStatus.PROCESSING || payment.razorpayOrderId !== data.razorpayOrderId) {
            throw new BadRequestException('This payment is not awaiting verification');
        }

        const isValid = this.paymentGatewayService.verifyPaymentSignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature);
        if (!isValid) {
            throw new BadRequestException('Payment signature verification failed');
        }

        const { order } = await this.completePaymentSuccess(payment, data.razorpayPaymentId);
        return this.toOrderSummary(order);
    }


    // Webhook API Endpoint — Razorpay server-to-server notification, verified
    // via its own signature header rather than a JWT. Idempotent: replaying
    // an already-terminal event, or one that arrives after the buyer's own
    // verify call already succeeded, is a safe no-op (requirement.md).
    async handleWebhookAPI(rawBody: string, signature: string): Promise<void> {
        if (!signature || !this.paymentGatewayService.verifyWebhookSignature(rawBody, signature)) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        const payload = JSON.parse(rawBody);
        const entity = payload?.payload?.payment?.entity;
        if (!entity?.order_id) {
            return; // not a payment event we care about
        }

        const payment = await this.paymentRepositoryService.findByRazorpayOrderId(entity.order_id);
        if (!payment) {
            this.logger.warn(`Webhook for unknown Razorpay order ${entity.order_id}`);
            return;
        }

        if (payload.event === 'payment.captured') {
            if (payment.status !== PaymentStatus.PROCESSING) {
                return; // already successful, or already failed/expired — don't resurrect
            }
            await this.completePaymentSuccess(payment, entity.id);
        } else if (payload.event === 'payment.failed') {
            if (payment.status === PaymentStatus.PROCESSING || payment.status === PaymentStatus.INITIATED) {
                await this.failPaymentAndCascade(payment, PaymentStatus.FAILED);
            }
        }
    }


    // Get Payment By Id API Endpoint (Buyer — own payment only)
    async getPaymentByIdAPI(paymentId: string, buyerId: string) {
        const payment = await this.getOwnedPayment(paymentId, buyerId);
        return this.toPaymentSummary(payment);
    }


    // List My Payments API Endpoint (Buyer)
    async listMyPaymentsAPI(buyerId: string) {
        const payments = await this.paymentRepositoryService.findByBuyerId(buyerId);
        return payments.map((payment) => this.toPaymentSummary(payment));
    }


    // Sweeps open payment windows that have expired — requirement.md: on
    // Failed OR Expired payment, cascade to the next-highest bidder.
    @Cron(CronExpression.EVERY_30_SECONDS)
    async sweepExpiredPayments(): Promise<void> {
        const now = new Date();
        const due = await this.paymentRepositoryService.findDueForExpiry(now);

        for (const payment of due) {
            await this.failPaymentAndCascade(payment, PaymentStatus.EXPIRED);
        }
    }


    // Reminds a buyer once their payment window has 5 minutes or less left —
    // requirement.md: "payment window reminder"
    @Cron(CronExpression.EVERY_30_SECONDS)
    async sendPaymentWindowReminders(): Promise<void> {
        const now = new Date();
        const due = await this.paymentRepositoryService.findDueForReminder(now, 5 * 60 * 1000);

        for (const payment of due) {
            const product = await this.productRepositoryService.findById(payment.productId.toString());
            const paymentId = (payment._id as Types.ObjectId).toString();
            await this.paymentRepositoryService.markReminderSent(paymentId);

            if (product) {
                const minutesLeft = Math.max(1, Math.round((payment.paymentWindowExpiresAt.getTime() - now.getTime()) / 60000));
                await this.notificationService.notifyAPI(
                    payment.buyerId.toString(),
                    NotificationType.PAYMENT_WINDOW_REMINDER,
                    { productName: product.name, minutesLeft: String(minutesLeft) },
                    { type: 'payment', id: paymentId },
                );
            }
        }
    }


    private async createPaymentAttempt(sessionId: Types.ObjectId, productId: Types.ObjectId, buyerId: Types.ObjectId, amount: number): Promise<PaymentDocument> {
        const now = new Date();
        return this.paymentRepositoryService.create({
            sessionId,
            productId,
            buyerId,
            amount,
            status: PaymentStatus.INITIATED,
            paymentWindowExpiresAt: new Date(now.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000),
            initiatedAt: now,
        });
    }


    // Marks a payment failed/expired, then offers the sale to the next
    // untried highest bidder from the same session (requirement.md's cascade
    // business rule) — or, if nobody's left, marks the product Unsold.
    private async failPaymentAndCascade(payment: PaymentDocument, status: PaymentStatus.FAILED | PaymentStatus.EXPIRED): Promise<void> {
        const paymentId = (payment._id as Types.ObjectId).toString();
        await this.paymentRepositoryService.markTerminal(paymentId, status);

        const sessionId = payment.sessionId.toString();
        const [allBids, allAttempts, product] = await Promise.all([
            this.bidRepositoryService.findBySessionId(sessionId),
            this.paymentRepositoryService.findAllBySessionId(sessionId),
            this.productRepositoryService.findById(payment.productId.toString()),
        ]);

        if (product) {
            await this.notificationService.notifyAPI(
                payment.buyerId.toString(),
                NotificationType.PAYMENT_FAILED,
                { productName: product.name },
                { type: 'payment', id: paymentId },
            );
        }

        const triedBuyerIds = new Set(allAttempts.map((attempt) => attempt.buyerId.toString()));
        const nextBid = allBids.find((bid) => !triedBuyerIds.has(bid.buyerId.toString()));

        if (!nextBid || !product) {
            await this.productRepositoryService.updateDetails(payment.productId.toString(), { status: ProductStatus.UNSOLD });
            this.logger.log(`Cascade exhausted for session ${sessionId} — product marked unsold`);
            return;
        }

        const quantity = product.verifiedQuantity ?? product.estimatedQuantity;
        await this.createPaymentAttempt(payment.sessionId, payment.productId, nextBid.buyerId, nextBid.amount * quantity);
        this.logger.log(`Session ${sessionId} cascaded to buyer ${nextBid.buyerId.toString()} at ${nextBid.amount}/unit`);
    }


    // Shared by the buyer's own verify call and the webhook — whichever
    // arrives first does the work; the other is a no-op against the same
    // Order (idempotency guard against duplicate delivery, per requirement.md).
    private async completePaymentSuccess(payment: PaymentDocument, razorpayPaymentId: string): Promise<{ order: OrderDocument }> {
        const paymentId = (payment._id as Types.ObjectId).toString();

        const existingOrder = await this.orderRepositoryService.findByPaymentId(paymentId);
        if (existingOrder) {
            if (payment.status !== PaymentStatus.SUCCESSFUL) {
                await this.paymentRepositoryService.markTerminal(paymentId, PaymentStatus.SUCCESSFUL, { razorpayPaymentId });
            }
            return { order: existingOrder };
        }

        await this.paymentRepositoryService.markTerminal(paymentId, PaymentStatus.SUCCESSFUL, { razorpayPaymentId });

        const product = await this.productRepositoryService.findById(payment.productId.toString());
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (!payment.deliveryAddress) {
            throw new BadRequestException('No delivery address was captured for this payment');
        }

        const quantity = product.verifiedQuantity ?? product.estimatedQuantity;
        const now = new Date();

        let order = await this.orderRepositoryService.create({
            productId: product._id as Types.ObjectId,
            sessionId: payment.sessionId,
            paymentId: payment._id as Types.ObjectId,
            buyerId: payment.buyerId,
            farmerId: product.farmerId,
            districtId: product.districtId,
            winningBidAmount: payment.amount / quantity,
            quantity,
            totalAmount: payment.amount,
            deliveryAddress: payment.deliveryAddress,
            deliveryStatus: DeliveryStatus.ORDER_CONFIRMED,
            deliveryStatusHistory: [{ status: DeliveryStatus.ORDER_CONFIRMED, timestamp: now, updatedBy: 'system' }],
        });

        // Reserve the matching Collection Center stock for this sale — was a
        // manual admin action (Collection Center Management, 05) until a real
        // sale existed to trigger it automatically, per its own TODO.
        const inventoryEntry = await this.collectionCenterInventoryRepositoryService.findByProductId((product._id as Types.ObjectId).toString());
        if (inventoryEntry && inventoryEntry.status === InventoryStatus.IN_STORAGE) {
            await this.collectionCenterInventoryRepositoryService.updateStatus(
                (inventoryEntry._id as Types.ObjectId).toString(),
                InventoryStatus.RESERVED_FOR_SALE,
                { reservedAt: now },
            );
        }

        // Auto-assign the least-loaded available Delivery Partner covering the
        // product's district (requirement.md) — if none is available, the
        // order is left unassigned for a District Admin to assign manually
        // (OrderService.assignDeliveryPartnerManuallyAPI).
        const partnerProfile = await this.deliveryPartnerProfileRepositoryService.findLeastLoadedAvailable(product.districtId.toString());
        if (partnerProfile) {
            const assigned = await this.orderRepositoryService.assignDeliveryPartner((order._id as Types.ObjectId).toString(), partnerProfile.userId.toString());
            if (assigned) {
                order = assigned;
            }
            await this.deliveryPartnerProfileRepositoryService.incrementActiveOrderCount(partnerProfile.userId.toString());

            await this.notificationService.notifyAPI(
                partnerProfile.userId.toString(),
                NotificationType.NEW_ORDER_ASSIGNED,
                { productName: product.name, city: payment.deliveryAddress.city },
                { type: 'order', id: (order._id as Types.ObjectId).toString() },
            );
        } else {
            this.logger.warn(`No available delivery partner in district ${product.districtId.toString()} for order ${(order._id as Types.ObjectId).toString()} — needs manual assignment`);

            const districtAdminId = await this.districtService.getDistrictAdminUserId(product.districtId.toString());
            if (districtAdminId) {
                await this.notificationService.notifyAPI(
                    districtAdminId,
                    NotificationType.DELIVERY_PARTNER_UNAVAILABLE,
                    { productName: product.name },
                    { type: 'order', id: (order._id as Types.ObjectId).toString() },
                );
            }
        }

        await this.notificationService.notifyAPI(
            payment.buyerId.toString(),
            NotificationType.PAYMENT_SUCCESS,
            { productName: product.name, amount: String(payment.amount) },
            { type: 'payment', id: paymentId },
        );

        const settings = await this.platformSettingsRepositoryService.getOrCreate();
        const commissionPercentage = settings.commissionPercentage;
        // amount * percentage / 100, rounded to 2 decimal places
        const commissionAmount = Math.round(payment.amount * commissionPercentage) / 100;
        const netPayoutAmount = Math.round((payment.amount - commissionAmount) * 100) / 100;

        await this.payoutRepositoryService.create({
            orderId: order._id as Types.ObjectId,
            farmerId: product.farmerId,
            grossAmount: payment.amount,
            commissionPercentage,
            commissionAmount,
            netPayoutAmount,
            status: PayoutStatus.PENDING,
        });

        return { order };
    }


    private async getOwnedPayment(paymentId: string, buyerId: string): Promise<PaymentDocument> {
        const payment = await this.paymentRepositoryService.findById(paymentId);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        if (payment.buyerId.toString() !== buyerId) {
            throw new ForbiddenException('You do not have access to this payment');
        }
        return payment;
    }


    private toCheckoutSummary(payment: PaymentDocument) {
        return {
            paymentId: (payment._id as Types.ObjectId).toString(),
            razorpayOrderId: payment.razorpayOrderId!,
            razorpayKeyId: this.paymentGatewayService.getKeyId(),
            amount: payment.amount,
            currency: 'INR',
        };
    }


    private toPaymentSummary(payment: PaymentDocument) {
        return {
            id: (payment._id as Types.ObjectId).toString(),
            sessionId: payment.sessionId.toString(),
            productId: payment.productId.toString(),
            buyerId: payment.buyerId.toString(),
            amount: payment.amount,
            status: payment.status,
            razorpayOrderId: payment.razorpayOrderId,
            paymentWindowExpiresAt: payment.paymentWindowExpiresAt,
            initiatedAt: payment.initiatedAt,
            completedAt: payment.completedAt,
        };
    }


    private toOrderSummary(order: OrderDocument) {
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
