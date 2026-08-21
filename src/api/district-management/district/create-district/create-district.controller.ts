import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateDistrictRequest } from './create-district.request';
import { CreateDistrictResponse } from './create-district.response';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DistrictService } from 'src/services/district-service/district.service';

@Controller('districts')
export class CreateDistrictController {
    constructor(private readonly districtService: DistrictService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async createDistrict(@Body() body: CreateDistrictRequest): Promise<CreateDistrictResponse> {
        const data = await this.districtService.createDistrictAPI(body);

        return {
            success: true,
            message: 'District created successfully',
            data,
        };
    }
}
