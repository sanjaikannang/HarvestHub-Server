import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateAvailabilityRequest } from './update-availability.request';
import { UpdateAvailabilityResponse } from './update-availability.response';
import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { DeliveryPartnerService } from 'src/services/user-service/delivery-partner/delivery-partner.service';

@Controller('delivery-partner/availability')
export class UpdateAvailabilityController {
    constructor(private readonly deliveryPartnerService: DeliveryPartnerService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.DELIVERY_PARTNER)
    async updateAvailability(@Body() body: UpdateAvailabilityRequest, @Req() req: Request): Promise<UpdateAvailabilityResponse> {
        const userId = (req as any).user.sub;
        const data = await this.deliveryPartnerService.updateAvailabilityAPI(userId, body.status);

        return {
            success: true,
            message: 'Availability updated successfully',
            data,
        };
    }
}
