import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InspectionService } from 'src/services/inspection-service/inspection.service';
import { ListMyInspectionsResponse } from './list-my-inspections.response';

@Controller('inspections/mine')
export class ListMyInspectionsController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.INSPECTOR)
    async listMyInspections(@Req() req: Request): Promise<ListMyInspectionsResponse> {
        const inspectorUserId = (req as any).user.sub;
        const data = await this.inspectionService.listMyInspectionsAPI(inspectorUserId);

        return {
            success: true,
            message: 'Inspections fetched successfully',
            data,
        };
    }
}
