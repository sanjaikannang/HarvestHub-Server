import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OrderService } from 'src/services/order-service/order.service';
import { ListMyOrdersResponse } from './list-my-orders.response';

// Buyer sees orders they placed; Farmer sees orders on their own products
// (see OrderService.listMyOrdersAPI)
@Controller('orders/mine')
export class ListMyOrdersController {
    constructor(private readonly orderService: OrderService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER, UserRole.FARMER)
    async listMyOrders(@Req() req: Request): Promise<ListMyOrdersResponse> {
        const requestingUser = (req as any).user;
        const data = await this.orderService.listMyOrdersAPI(requestingUser);

        return {
            success: true,
            message: 'Orders fetched successfully',
            data,
        };
    }
}
