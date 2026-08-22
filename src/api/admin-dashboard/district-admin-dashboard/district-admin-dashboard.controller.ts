import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from 'src/services/dashboard-service/dashboard.service';
import { DistrictAdminDashboardResponse } from './district-admin-dashboard.response';

@Controller('dashboard/district-admin')
export class DistrictAdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.DISTRICT_ADMIN)
    async getDistrictAdminDashboard(@Req() req: Request): Promise<DistrictAdminDashboardResponse> {
        const userId = (req as any).user.sub;
        const data = await this.dashboardService.getDistrictAdminDashboardAPI(userId);

        return {
            success: true,
            message: 'Dashboard fetched successfully',
            data,
        };
    }
}
