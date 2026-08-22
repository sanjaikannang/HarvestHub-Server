import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListOrdersQuery } from './list-orders.request';
import { ListOrdersResponse } from './list-orders.response';
import { OrderService } from 'src/services/order-service/order.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('orders')
export class ListOrdersController {
    constructor(private readonly orderService: OrderService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listOrders(@Query() query: ListOrdersQuery, @Req() req: Request): Promise<ListOrdersResponse> {
        const requestingUser = (req as any).user;
        const data = await this.orderService.listOrdersAPI(requestingUser, query);

        return {
            success: true,
            message: 'Orders fetched successfully',
            data,
        };
    }
}
