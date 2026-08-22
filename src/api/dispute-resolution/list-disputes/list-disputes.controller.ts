import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListDisputesQuery } from './list-disputes.request';
import { ListDisputesResponse } from './list-disputes.response';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('disputes')
export class ListDisputesController {
    constructor(private readonly disputeService: DisputeService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listDisputes(@Query() query: ListDisputesQuery, @Req() req: Request): Promise<ListDisputesResponse> {
        const requestingUser = (req as any).user;
        const data = await this.disputeService.listDisputesAPI(requestingUser, query);

        return {
            success: true,
            message: 'Disputes fetched successfully',
            data,
        };
    }
}
