import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListInspectionsQuery } from './list-inspections.request';
import { ListInspectionsResponse } from './list-inspections.response';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { InspectionService } from 'src/services/inspection-service/inspection.service';

@Controller('inspections')
export class ListInspectionsController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listInspections(@Query() query: ListInspectionsQuery, @Req() req: Request): Promise<ListInspectionsResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inspectionService.listInspectionsAPI(requestingUser, query.districtId);

        return {
            success: true,
            message: 'Inspections fetched successfully',
            data,
        };
    }
}
