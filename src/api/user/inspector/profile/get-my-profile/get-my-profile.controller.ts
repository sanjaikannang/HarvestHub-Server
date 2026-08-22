import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InspectorService } from 'src/services/user-service/inspector/inspector.service';
import { GetMyProfileResponse } from './get-my-profile.response';

@Controller('inspector')
export class GetMyProfileController {
    constructor(private readonly inspectorService: InspectorService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.INSPECTOR)
    async getMyProfile(@Req() req: Request): Promise<GetMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.inspectorService.getMyProfileAPI(userId);

        return {
            success: true,
            message: 'Profile fetched successfully',
            data,
        };
    }
}
