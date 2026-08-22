import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetSettingsResponse } from './get-settings.response';
import { PlatformSettingsService } from 'src/services/platform-settings-service/platform-settings.service';

@Controller('platform-settings')
export class GetSettingsController {
    constructor(private readonly platformSettingsService: PlatformSettingsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getSettings(): Promise<GetSettingsResponse> {
        const data = await this.platformSettingsService.getSettingsAPI();

        return {
            success: true,
            message: 'Platform settings fetched successfully',
            data,
        };
    }
}
