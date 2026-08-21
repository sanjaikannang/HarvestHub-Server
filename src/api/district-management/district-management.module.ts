import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { DistrictService } from 'src/services/district-service/district.service';
import { CollectionCenterService } from 'src/services/collection-center-service/collection-center.service';

// District controllers
import { CreateDistrictController } from './district/create-district/create-district.controller';
import { UpdateDistrictController } from './district/update-district/update-district.controller';
import { DeactivateDistrictController } from './district/deactivate-district/deactivate-district.controller';
import { AssignDistrictAdminController } from './district/assign-district-admin/assign-district-admin.controller';
import { ListDistrictsController } from './district/list-districts/list-districts.controller';
import { GetDistrictController } from './district/get-district/get-district.controller';

// Collection center controllers
import { CreateCollectionCenterController } from './collection-center/create-collection-center/create-collection-center.controller';
import { UpdateCollectionCenterController } from './collection-center/update-collection-center/update-collection-center.controller';
import { ListCollectionCentersController } from './collection-center/list-collection-centers/list-collection-centers.controller';
import { GetCollectionCenterController } from './collection-center/get-collection-center/get-collection-center.controller';

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
        CreateDistrictController,
        UpdateDistrictController,
        DeactivateDistrictController,
        AssignDistrictAdminController,
        ListDistrictsController,
        GetDistrictController,
        CreateCollectionCenterController,
        UpdateCollectionCenterController,
        ListCollectionCentersController,
        GetCollectionCenterController,
    ],
    providers: [
        ConfigService,
        DistrictService,
        CollectionCenterService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        DistrictService,
        CollectionCenterService,
    ],
})
export class DistrictManagementModule { }
