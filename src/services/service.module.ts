import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

// Services
import { AuthService } from "./auth-service/auth.service";
import { AuthJwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { AdminService } from "./user-service/admin/admin.service";
import { FarmerService } from "./user-service/farmer/farmer.service";
import { BuyerService } from "./user-service/buyer/buyer.service";
import { DeliveryPartnerService } from "./user-service/delivery-partner/delivery-partner.service";
import { DistrictService } from "./district-service/district.service";
import { CollectionCenterService } from "./collection-center-service/collection-center.service";
import { ConfigService } from "src/config/config.service";

// Modules
import { ConfigModule } from "src/config/config.module";
import { RepositoryModule } from "src/repositories/repository.module";

@Module({
    imports: [
        RepositoryModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: { expiresIn: configService.getJWTExpiresIn() },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [
        AuthService,
        AuthJwtService,
        PasswordService,
        AdminService,
        FarmerService,
        BuyerService,
        DeliveryPartnerService,
        DistrictService,
        CollectionCenterService,
    ],
    exports: [
        AuthService,
        PasswordService,
        AuthJwtService,
        AdminService,
        FarmerService,
        BuyerService,
        DeliveryPartnerService,
        DistrictService,
        CollectionCenterService,
    ],
})
export class ServiceModule { }
