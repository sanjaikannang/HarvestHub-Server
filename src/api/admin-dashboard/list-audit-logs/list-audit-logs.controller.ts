import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListAuditLogsQuery } from './list-audit-logs.request';
import { ListAuditLogsResponse } from './list-audit-logs.response';
import { DashboardService } from 'src/services/dashboard-service/dashboard.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('audit-logs')
export class ListAuditLogsController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listAuditLogs(@Query() query: ListAuditLogsQuery, @Req() req: Request): Promise<ListAuditLogsResponse> {
        const requestingUser = (req as any).user;
        const data = await this.dashboardService.listAuditLogsAPI(requestingUser, query);

        return {
            success: true,
            message: 'Audit logs fetched successfully',
            data,
        };
    }
}
