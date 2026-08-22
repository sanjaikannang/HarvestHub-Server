import { Module } from '@nestjs/common';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { DashboardService } from 'src/services/dashboard-service/dashboard.service';

// Controllers
import { SuperAdminDashboardController } from './super-admin-dashboard/super-admin-dashboard.controller';
import { DistrictAdminDashboardController } from './district-admin-dashboard/district-admin-dashboard.controller';
import { ListAuditLogsController } from './list-audit-logs/list-audit-logs.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        SuperAdminDashboardController,
        DistrictAdminDashboardController,
        ListAuditLogsController,
    ],
    providers: [
        DashboardService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AdminDashboardModule { }
