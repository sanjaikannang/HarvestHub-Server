import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { RaiseDisputeRequest } from './raise-dispute.request';
import { RaiseDisputeResponse } from './raise-dispute.response';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

@Controller('disputes')
export class RaiseDisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async raiseDispute(@Body() body: RaiseDisputeRequest, @Req() req: Request): Promise<RaiseDisputeResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.disputeService.raiseDisputeAPI(buyerId, body);

        return {
            success: true,
            message: 'Dispute raised successfully',
            data,
        };
    }
}
