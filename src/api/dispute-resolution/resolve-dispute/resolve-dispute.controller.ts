import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { ResolveDisputeRequest } from './resolve-dispute.request';
import { ResolveDisputeResponse } from './resolve-dispute.response';
import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('disputes/:id/resolve')
export class ResolveDisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async resolveDispute(@Param('id') id: string, @Body() body: ResolveDisputeRequest, @Req() req: Request): Promise<ResolveDisputeResponse> {
        const requestingUser = (req as any).user;
        const data = await this.disputeService.resolveDisputeAPI(id, requestingUser, body);

        return {
            success: true,
            message: 'Dispute resolved successfully',
            data,
        };
    }
}
