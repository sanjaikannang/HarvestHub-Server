import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { UserRepositoryService } from "./user-repository/user.repository";
import { AuthActivityLogRepositoryService } from "./auth-activity-log-repository/auth-activity-log.repository";
import { DistrictRepositoryService } from "./district-repository/district.repository";
import { CollectionCenterRepositoryService } from "./collection-center-repository/collection-center.repository";
import { CategoryRepositoryService } from "./category-repository/category.repository";
import { ProductRepositoryService } from "./product-repository/product.repository";
import { AuditLogRepositoryService } from "./audit-log-repository/audit-log.repository";
import { InspectionRepositoryService } from "./inspection-repository/inspection.repository";
import { CollectionCenterInventoryRepositoryService } from "./collection-center-inventory-repository/collection-center-inventory.repository";
import { BiddingSessionRepositoryService } from "./bidding-session-repository/bidding-session.repository";
import { BidRepositoryService } from "./bid-repository/bid.repository";
import { PaymentRepositoryService } from "./payment-repository/payment.repository";
import { OrderRepositoryService } from "./order-repository/order.repository";
import { PayoutRepositoryService } from "./payout-repository/payout.repository";
import { PlatformSettingsRepositoryService } from "./platform-settings-repository/platform-settings.repository";
import { DeliveryPartnerProfileRepositoryService } from "./delivery-partner-profile-repository/delivery-partner-profile.repository";
import { NotificationRepositoryService } from "./notification-repository/notification.repository";
import { NotificationTemplateRepositoryService } from "./notification-template-repository/notification-template.repository";
import { DisputeRepositoryService } from "./dispute-repository/dispute.repository";

// Schemas
import { User, UserSchema } from "src/schemas/User/user.schema";
import { AuthActivityLog, AuthActivityLogSchema } from "src/schemas/AuthActivityLog/auth-activity-log.schema";
import { District, DistrictSchema } from "src/schemas/District/district.schema";
import { CollectionCenter, CollectionCenterSchema } from "src/schemas/CollectionCenter/collection-center.schema";
import { Category, CategorySchema } from "src/schemas/Category/category.schema";
import { Product, ProductSchema } from "src/schemas/Product/product.schema";
import { AuditLog, AuditLogSchema } from "src/schemas/AuditLog/audit-log.schema";
import { Inspection, InspectionSchema } from "src/schemas/Inspection/inspection.schema";
import { CollectionCenterInventory, CollectionCenterInventorySchema } from "src/schemas/CollectionCenterInventory/collection-center-inventory.schema";
import { BiddingSession, BiddingSessionSchema } from "src/schemas/BiddingSession/bidding-session.schema";
import { Bid, BidSchema } from "src/schemas/Bid/bid.schema";
import { Payment, PaymentSchema } from "src/schemas/Payment/payment.schema";
import { Order, OrderSchema } from "src/schemas/Order/order.schema";
import { Payout, PayoutSchema } from "src/schemas/Payout/payout.schema";
import { PlatformSettings, PlatformSettingsSchema } from "src/schemas/PlatformSettings/platform-settings.schema";
import { DeliveryPartnerProfile, DeliveryPartnerProfileSchema } from "src/schemas/DeliveryPartnerProfile/delivery-partner-profile.schema";
import { Notification, NotificationSchema } from "src/schemas/Notification/notification.schema";
import { NotificationTemplate, NotificationTemplateSchema } from "src/schemas/NotificationTemplate/notification-template.schema";
import { Dispute, DisputeSchema } from "src/schemas/Dispute/dispute.schema";

// Single aggregator module for every repository in the app — feature modules
// import this once rather than wiring MongooseModule.forFeature() themselves.
// Add new schemas/repositories here as HarvestHub's other modules (orders,
// notifications, etc.) get built out.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuthActivityLog.name, schema: AuthActivityLogSchema },
            { name: District.name, schema: DistrictSchema },
            { name: CollectionCenter.name, schema: CollectionCenterSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Product.name, schema: ProductSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Inspection.name, schema: InspectionSchema },
            { name: CollectionCenterInventory.name, schema: CollectionCenterInventorySchema },
            { name: BiddingSession.name, schema: BiddingSessionSchema },
            { name: Bid.name, schema: BidSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Payout.name, schema: PayoutSchema },
            { name: PlatformSettings.name, schema: PlatformSettingsSchema },
            { name: DeliveryPartnerProfile.name, schema: DeliveryPartnerProfileSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
            { name: Dispute.name, schema: DisputeSchema },
        ]),
    ],
    controllers: [],
    providers: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
        CategoryRepositoryService,
        ProductRepositoryService,
        AuditLogRepositoryService,
        InspectionRepositoryService,
        CollectionCenterInventoryRepositoryService,
        BiddingSessionRepositoryService,
        BidRepositoryService,
        PaymentRepositoryService,
        OrderRepositoryService,
        PayoutRepositoryService,
        PlatformSettingsRepositoryService,
        DeliveryPartnerProfileRepositoryService,
        NotificationRepositoryService,
        NotificationTemplateRepositoryService,
        DisputeRepositoryService,
    ],
    exports: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
        CategoryRepositoryService,
        ProductRepositoryService,
        AuditLogRepositoryService,
        InspectionRepositoryService,
        CollectionCenterInventoryRepositoryService,
        BiddingSessionRepositoryService,
        BidRepositoryService,
        PaymentRepositoryService,
        OrderRepositoryService,
        PayoutRepositoryService,
        PlatformSettingsRepositoryService,
        DeliveryPartnerProfileRepositoryService,
        NotificationRepositoryService,
        NotificationTemplateRepositoryService,
        DisputeRepositoryService,
    ],
})
export class RepositoryModule { }
