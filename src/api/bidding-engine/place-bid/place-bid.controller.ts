import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlaceBidRequest } from './place-bid.request';
import { PlaceBidResponse } from './place-bid.response';
import { BiddingService } from 'src/services/bidding-service/bidding.service';
import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('bidding-sessions')
export class PlaceBidController {
    constructor(private readonly biddingService: BiddingService) { }

    @Post(':productId/bids')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.BUYER)
    async placeBid(
        @Param('productId') productId: string,
        @Body() body: PlaceBidRequest,
        @Req() req: Request,
    ): Promise<PlaceBidResponse> {
        const buyerId = (req as any).user.sub;
        const data = await this.biddingService.placeBidAPI(productId, buyerId, body.amount);

        return {
            success: true,
            message: 'Bid placed successfully',
            data,
        };
    }
}
