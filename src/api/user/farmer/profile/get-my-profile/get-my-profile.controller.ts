import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FarmerService } from 'src/services/user-service/farmer/farmer.service';
import { GetMyProfileResponse } from './get-my-profile.response';

@Controller('farmer')
export class GetMyProfileController {
    constructor(private readonly farmerService: FarmerService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FARMER)
    async getMyProfile(@Req() req: Request): Promise<GetMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.farmerService.getMyProfileAPI(userId);

        return {
            success: true,
            message: 'Profile fetched successfully',
            data,
        };
    }
}
