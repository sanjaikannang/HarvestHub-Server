import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DeliveryPartnerService } from 'src/services/user-service/delivery-partner/delivery-partner.service';
import { GetMyProfileResponse } from './get-my-profile.response';

@Controller('delivery-partner')
export class GetMyProfileController {
    constructor(private readonly deliveryPartnerService: DeliveryPartnerService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.DELIVERY_PARTNER)
    async getMyProfile(@Req() req: Request): Promise<GetMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.deliveryPartnerService.getMyProfileAPI(userId);

        return {
            success: true,
            message: 'Profile fetched successfully',
            data,
        };
    }
}
