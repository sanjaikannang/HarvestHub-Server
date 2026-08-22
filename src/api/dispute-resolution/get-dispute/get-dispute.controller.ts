import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetDisputeResponse } from './get-dispute.response';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

@Controller('disputes')
export class GetDisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.BUYER)
    async getDispute(@Param('id') id: string, @Req() req: Request): Promise<GetDisputeResponse> {
        const requestingUser = (req as any).user;
        const data = await this.disputeService.getDisputeByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Dispute fetched successfully',
            data,
        };
    }
}
