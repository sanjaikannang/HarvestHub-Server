import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListPayoutsQuery } from './list-payouts.request';
import { ListPayoutsResponse } from './list-payouts.response';
import { PayoutService } from 'src/services/payout-service/payout.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('payouts')
export class ListPayoutsController {
    constructor(private readonly payoutService: PayoutService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listPayouts(@Query() query: ListPayoutsQuery, @Req() req: Request): Promise<ListPayoutsResponse> {
        const requestingUser = (req as any).user;
        const data = await this.payoutService.listPayoutsAPI(requestingUser, query);

        return {
            success: true,
            message: 'Payouts fetched successfully',
            data,
        };
    }
}
