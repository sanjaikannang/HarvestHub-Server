import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetInspectionResponse } from './get-inspection.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { InspectionService } from 'src/services/inspection-service/inspection.service';

@Controller('inspections')
export class GetInspectionController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.INSPECTOR)
    async getInspection(@Param('id') id: string, @Req() req: Request): Promise<GetInspectionResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inspectionService.getInspectionByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Inspection fetched successfully',
            data,
        };
    }
}
