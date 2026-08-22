import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PayoutService } from 'src/services/payout-service/payout.service';
import { ListMyPayoutsResponse } from './list-my-payouts.response';

@Controller('payouts/mine')
export class ListMyPayoutsController {
    constructor(private readonly payoutService: PayoutService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FARMER)
    async listMyPayouts(@Req() req: Request): Promise<ListMyPayoutsResponse> {
        const farmerId = (req as any).user.sub;
        const data = await this.payoutService.listMyPayoutsAPI(farmerId);

        return {
            success: true,
            message: 'Payouts fetched successfully',
            data,
        };
    }
}
