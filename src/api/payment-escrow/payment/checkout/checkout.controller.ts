import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CheckoutRequest } from './checkout.request';
import { CheckoutResponse } from './checkout.response';
import { PaymentService } from 'src/services/payment-service/payment.service';
import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('payments')
export class CheckoutController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post(':id/checkout')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async checkout(
        @Param('id') id: string,
        @Body() body: CheckoutRequest,
        @Req() req: Request,
    ): Promise<CheckoutResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.paymentService.checkoutAPI(id, buyerId, body.deliveryAddress);

        return {
            success: true,
            message: 'Checkout session created successfully',
            data,
        };
    }
}
