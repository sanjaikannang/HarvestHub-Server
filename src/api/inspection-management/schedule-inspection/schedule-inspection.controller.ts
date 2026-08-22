import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ScheduleInspectionRequest } from './schedule-inspection.request';
import { ScheduleInspectionResponse } from './schedule-inspection.response';
import { InspectionService } from 'src/services/inspection-service/inspection.service';

@Controller('inspections')
export class ScheduleInspectionController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async scheduleInspection(@Body() body: ScheduleInspectionRequest, @Req() req: Request): Promise<ScheduleInspectionResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inspectionService.scheduleInspectionAPI(body, requestingUser);

        return {
            success: true,
            message: 'Inspection scheduled successfully',
            data,
        };
    }
}
