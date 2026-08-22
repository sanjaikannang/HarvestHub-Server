import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { VerifyPaymentRequest } from './verify-payment.request';
import { VerifyPaymentResponse } from './verify-payment.response';
import { PaymentService } from 'src/services/payment-service/payment.service';
import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('payments')
export class VerifyPaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post(':id/verify')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async verify(
        @Param('id') id: string,
        @Body() body: VerifyPaymentRequest,
        @Req() req: Request,
    ): Promise<VerifyPaymentResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.paymentService.verifyPaymentAPI(id, buyerId, body);

        return {
            success: true,
            message: 'Payment verified — order confirmed',
            data,
        };
    }
}
