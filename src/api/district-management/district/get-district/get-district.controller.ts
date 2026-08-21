import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetDistrictResponse } from './get-district.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DistrictService } from 'src/services/district-service/district.service';

@Controller('districts')
export class GetDistrictController {
    constructor(private readonly districtService: DistrictService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async getDistrict(@Param('id') id: string, @Req() req: Request): Promise<GetDistrictResponse> {
        const requestingUser = (req as any).user;
        const data = await this.districtService.getDistrictByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'District fetched successfully',
            data,
        };
    }
}
