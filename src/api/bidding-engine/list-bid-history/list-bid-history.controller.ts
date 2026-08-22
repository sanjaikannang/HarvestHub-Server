import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListBidHistoryResponse } from './list-bid-history.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { BiddingService } from 'src/services/bidding-service/bidding.service';

@Controller('bidding-sessions')
export class ListBidHistoryController {
    constructor(private readonly biddingService: BiddingService) { }

    @Get(':productId/bids')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.FARMER, UserRole.BUYER, UserRole.INSPECTOR)
    async listBidHistory(@Param('productId') productId: string, @Req() req: Request): Promise<ListBidHistoryResponse> {
        const requestingUser = (req as any).user;
        const data = await this.biddingService.listBidHistoryAPI(productId, requestingUser);

        return {
            success: true,
            message: 'Bid history fetched successfully',
            data,
        };
    }
}
