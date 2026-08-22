import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OrderService } from 'src/services/order-service/order.service';
import { UpdateOrderStatusRequest } from './update-order-status.request';
import { UpdateOrderStatusResponse } from './update-order-status.response';
import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('orders/:id/status')
export class UpdateOrderStatusController {
    constructor(private readonly orderService: OrderService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.DELIVERY_PARTNER)
    async updateOrderStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusRequest, @Req() req: Request): Promise<UpdateOrderStatusResponse> {
        const requestingUser = (req as any).user;
        const data = await this.orderService.updateOrderStatusAPI(id, requestingUser, body.status);

        return {
            success: true,
            message: 'Order status updated successfully',
            data,
        };
    }
}
