import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BuyerService } from 'src/services/user-service/buyer/buyer.service';
import { GetMyProfileResponse } from './get-my-profile.response';

@Controller('buyer')
export class GetMyProfileController {
    constructor(private readonly buyerService: BuyerService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async getMyProfile(@Req() req: Request): Promise<GetMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.buyerService.getMyProfileAPI(userId);

        return {
            success: true,
            message: 'Profile fetched successfully',
            data,
        };
    }
}
