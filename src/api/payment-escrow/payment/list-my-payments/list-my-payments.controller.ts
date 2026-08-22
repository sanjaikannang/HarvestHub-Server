import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from 'src/services/payment-service/payment.service';
import { ListMyPaymentsResponse } from './list-my-payments.response';

@Controller('payments/mine')
export class ListMyPaymentsController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async listMyPayments(@Req() req: Request): Promise<ListMyPaymentsResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.paymentService.listMyPaymentsAPI(buyerId);

        return {
            success: true,
            message: 'Payments fetched successfully',
            data,
        };
    }
}
