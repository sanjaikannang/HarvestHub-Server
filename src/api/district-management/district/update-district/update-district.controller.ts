import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateDistrictRequest } from './update-district.request';
import { UpdateDistrictResponse } from './update-district.response';
import { DistrictService } from 'src/services/district-service/district.service';
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';

@Controller('districts')
export class UpdateDistrictController {
    constructor(private readonly districtService: DistrictService) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updateDistrict(
        @Param('id') id: string,
        @Body() body: UpdateDistrictRequest,
    ): Promise<UpdateDistrictResponse> {
        const data = await this.districtService.updateDistrictAPI(id, body);

        return {
            success: true,
            message: 'District updated successfully',
            data,
        };
    }
}
