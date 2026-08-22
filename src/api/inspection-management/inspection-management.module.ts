import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { InspectionService } from 'src/services/inspection-service/inspection.service';
import { DistrictService } from 'src/services/district-service/district.service';

// Controllers — ListMyInspections (/inspections/mine) MUST be registered
// before GetInspection (/inspections/:id), or Express will match "mine" as an :id.
import { ScheduleInspectionController } from './schedule-inspection/schedule-inspection.controller';
import { ListMyInspectionsController } from './list-my-inspections/list-my-inspections.controller';
import { GetInspectionController } from './get-inspection/get-inspection.controller';
import { ListInspectionsController } from './list-inspections/list-inspections.controller';
import { RecordFindingsController } from './record-findings/record-findings.controller';
import { DecideInspectionController } from './decide-inspection/decide-inspection.controller';

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
        ScheduleInspectionController,
        ListMyInspectionsController,
        GetInspectionController,
        ListInspectionsController,
        RecordFindingsController,
        DecideInspectionController,
    ],
    providers: [
        ConfigService,
        InspectionService,
        DistrictService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        InspectionService,
    ],
})
export class InspectionManagementModule { }
