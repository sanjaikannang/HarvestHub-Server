import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './user/admin/admin.module';
import { FarmerModule } from './user/farmer/farmer.module';
import { BuyerModule } from './user/buyer/buyer.module';
import { DeliveryPartnerModule } from './user/delivery-partner/delivery-partner.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    FarmerModule,
    BuyerModule,
    DeliveryPartnerModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule { }
