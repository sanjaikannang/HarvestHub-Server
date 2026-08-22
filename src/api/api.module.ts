import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './user/admin/admin.module';
import { FarmerModule } from './user/farmer/farmer.module';
import { BuyerModule } from './user/buyer/buyer.module';
import { DeliveryPartnerModule } from './user/delivery-partner/delivery-partner.module';
import { InspectorModule } from './user/inspector/inspector.module';
import { DistrictManagementModule } from './district-management/district-management.module';
import { CatalogManagementModule } from './catalog-management/catalog-management.module';
import { InspectionManagementModule } from './inspection-management/inspection-management.module';
import { CollectionCenterManagementModule } from './collection-center-management/collection-center-management.module';
import { BiddingEngineModule } from './bidding-engine/bidding-engine.module';
import { PaymentEscrowModule } from './payment-escrow/payment-escrow.module';
import { NotificationManagementModule } from './notification-management/notification-management.module';
import { DisputeResolutionModule } from './dispute-resolution/dispute-resolution.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    FarmerModule,
    BuyerModule,
    DeliveryPartnerModule,
    InspectorModule,
    DistrictManagementModule,
    CatalogManagementModule,
    InspectionManagementModule,
    CollectionCenterManagementModule,
    BiddingEngineModule,
    PaymentEscrowModule,
    NotificationManagementModule,
    DisputeResolutionModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule { }
