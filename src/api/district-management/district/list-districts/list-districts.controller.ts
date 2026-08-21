import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DistrictService } from 'src/services/district-service/district.service';
import { ListDistrictsResponse } from './list-districts.response';

@Controller('districts')
export class ListDistrictsController {
    constructor(private readonly districtService: DistrictService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async listDistricts(): Promise<ListDistrictsResponse> {
        const data = await this.districtService.getDistrictDirectoryAPI();

        return {
            success: true,
            message: 'Districts fetched successfully',
            data,
        };
    }
}
