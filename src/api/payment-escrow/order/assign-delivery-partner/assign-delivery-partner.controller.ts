import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OrderService } from 'src/services/order-service/order.service';
import { AssignDeliveryPartnerRequest } from './assign-delivery-partner.request';
import { AssignDeliveryPartnerResponse } from './assign-delivery-partner.response';
import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('orders/:id/assign-delivery-partner')
export class AssignDeliveryPartnerController {
    constructor(private readonly orderService: OrderService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async assignDeliveryPartner(@Param('id') id: string, @Body() body: AssignDeliveryPartnerRequest, @Req() req: Request): Promise<AssignDeliveryPartnerResponse> {
        const requestingUser = (req as any).user;
        const data = await this.orderService.assignDeliveryPartnerManuallyAPI(id, body.deliveryPartnerId, requestingUser);

        return {
            success: true,
            message: 'Delivery partner assigned successfully',
            data,
        };
    }
}
