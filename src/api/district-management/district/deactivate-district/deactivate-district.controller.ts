import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { DistrictService } from 'src/services/district-service/district.service';
import { DeactivateDistrictResponse } from './deactivate-district.response';

@Controller('districts')
export class DeactivateDistrictController {
    constructor(private readonly districtService: DistrictService) { }

    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async deactivateDistrict(@Param('id') id: string): Promise<DeactivateDistrictResponse> {
        const data = await this.districtService.deactivateDistrictAPI(id);

        return {
            success: true,
            message: 'District deactivated successfully',
            data,
        };
    }
}
