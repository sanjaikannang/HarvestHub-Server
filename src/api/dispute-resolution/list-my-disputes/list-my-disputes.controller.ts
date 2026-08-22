import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { ListMyDisputesResponse } from './list-my-disputes.response';

@Controller('disputes/mine')
export class ListMyDisputesController {
    constructor(private readonly disputeService: DisputeService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async listMyDisputes(@Req() req: Request): Promise<ListMyDisputesResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.disputeService.listMyDisputesAPI(buyerId);

        return {
            success: true,
            message: 'Disputes fetched successfully',
            data,
        };
    }
}
