import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UpdateSettingsRequest } from './update-settings.request';
import { UpdateSettingsResponse } from './update-settings.response';
import { PlatformSettingsService } from 'src/services/platform-settings-service/platform-settings.service';

@Controller('platform-settings')
export class UpdateSettingsController {
    constructor(private readonly platformSettingsService: PlatformSettingsService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updateSettings(@Body() body: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
        const data = await this.platformSettingsService.updateCommissionAPI(body.commissionPercentage);

        return {
            success: true,
            message: 'Platform settings updated successfully',
            data,
        };
    }
}
