import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RecordFindingsRequest } from './record-findings.request';
import { RecordFindingsResponse } from './record-findings.response';
import { InspectionService } from 'src/services/inspection-service/inspection.service';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('inspections')
export class RecordFindingsController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Patch(':id/findings')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.INSPECTOR)
    async recordFindings(
        @Param('id') id: string,
        @Body() body: RecordFindingsRequest,
        @Req() req: Request,
    ): Promise<RecordFindingsResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inspectionService.recordFindingsAPI(id, body, requestingUser);

        return {
            success: true,
            message: 'Findings recorded successfully',
            data,
        };
    }
}
