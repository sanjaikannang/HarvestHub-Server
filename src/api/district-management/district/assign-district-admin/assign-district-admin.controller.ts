import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DistrictService } from 'src/services/district-service/district.service';
import { AssignDistrictAdminRequest } from './assign-district-admin.request';
import { AssignDistrictAdminResponse } from './assign-district-admin.response';

@Controller('districts')
export class AssignDistrictAdminController {
    constructor(private readonly districtService: DistrictService) { }

    @Patch(':id/assign-admin')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async assignDistrictAdmin(
        @Param('id') id: string,
        @Body() body: AssignDistrictAdminRequest,
    ): Promise<AssignDistrictAdminResponse> {
        const data = await this.districtService.assignDistrictAdminAPI(id, body.userId);

        return {
            success: true,
            message: 'District admin assigned successfully',
            data,
        };
    }
}
