import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetPaymentResponse } from './get-payment.response';
import { PaymentService } from 'src/services/payment-service/payment.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

@Controller('payments')
export class GetPaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async getPayment(@Param('id') id: string, @Req() req: Request): Promise<GetPaymentResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.paymentService.getPaymentByIdAPI(id, buyerId);

        return {
            success: true,
            message: 'Payment fetched successfully',
            data,
        };
    }
}
