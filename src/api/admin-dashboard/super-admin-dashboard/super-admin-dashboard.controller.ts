import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from 'src/services/dashboard-service/dashboard.service';
import { SuperAdminDashboardResponse } from './super-admin-dashboard.response';

@Controller('dashboard/super-admin')
export class SuperAdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getSuperAdminDashboard(): Promise<SuperAdminDashboardResponse> {
        const data = await this.dashboardService.getSuperAdminDashboardAPI();

        return {
            success: true,
            message: 'Dashboard fetched successfully',
            data,
        };
    }
}
