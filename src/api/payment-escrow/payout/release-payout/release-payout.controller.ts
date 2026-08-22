import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ReleasePayoutResponse } from './release-payout.response';
import { PayoutService } from 'src/services/payout-service/payout.service';
import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('payouts/:id/release')
export class ReleasePayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async releasePayout(@Param('id') id: string, @Req() req: Request): Promise<ReleasePayoutResponse> {
        const requestingUser = (req as any).user;
        const data = await this.payoutService.releasePayoutAPI(id, requestingUser);

        return {
            success: true,
            message: 'Payout released successfully',
            data,
        };
    }
}
