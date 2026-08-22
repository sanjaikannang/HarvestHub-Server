import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BiddingService } from 'src/services/bidding-service/bidding.service';
import { ListMyBidsResponse } from './list-my-bids.response';

@Controller('bids/mine')
export class ListMyBidsController {
    constructor(private readonly biddingService: BiddingService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async listMyBids(@Req() req: Request): Promise<ListMyBidsResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.biddingService.listMyBidsAPI(buyerId);

        return {
            success: true,
            message: 'Bids fetched successfully',
            data,
        };
    }
}
