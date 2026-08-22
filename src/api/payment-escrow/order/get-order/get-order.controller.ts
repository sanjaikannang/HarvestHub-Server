import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetOrderResponse } from './get-order.response';
import { OrderService } from 'src/services/order-service/order.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

@Controller('orders')
export class GetOrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.BUYER, UserRole.FARMER)
    async getOrder(@Param('id') id: string, @Req() req: Request): Promise<GetOrderResponse> {
        const requestingUser = (req as any).user;
        const data = await this.orderService.getOrderByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Order fetched successfully',
            data,
        };
    }
}
