import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DecideInspectionRequest } from './decide-inspection.request';
import { DecideInspectionResponse } from './decide-inspection.response';
import { InspectionService } from 'src/services/inspection-service/inspection.service';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('inspections')
export class DecideInspectionController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Patch(':id/decision')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async decideInspection(
        @Param('id') id: string,
        @Body() body: DecideInspectionRequest,
        @Req() req: Request,
    ): Promise<DecideInspectionResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inspectionService.decideAPI(id, body.decision, body, requestingUser);

        return {
            success: true,
            message: 'Decision recorded successfully',
            data,
        };
    }
}
