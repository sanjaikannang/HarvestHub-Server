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
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule { }
