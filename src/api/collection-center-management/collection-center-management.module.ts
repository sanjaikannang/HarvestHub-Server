import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { CollectionCenterInventoryService } from 'src/services/collection-center-inventory-service/collection-center-inventory.service';
import { DistrictService } from 'src/services/district-service/district.service';

// Controllers
import { ListInventoryController } from './list-inventory/list-inventory.controller';
import { GetInventoryController } from './get-inventory/get-inventory.controller';
import { ReserveInventoryController } from './reserve-inventory/reserve-inventory.controller';
import { DispatchInventoryController } from './dispatch-inventory/dispatch-inventory.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        ListInventoryController,
        GetInventoryController,
        ReserveInventoryController,
        DispatchInventoryController,
    ],
    providers: [
        ConfigService,
        CollectionCenterInventoryService,
        DistrictService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        CollectionCenterInventoryService,
    ],
})
export class CollectionCenterManagementModule { }
