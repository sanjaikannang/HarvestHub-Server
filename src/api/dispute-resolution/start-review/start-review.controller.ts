import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { StartReviewResponse } from './start-review.response';
import { DisputeService } from 'src/services/dispute-service/dispute.service';
import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('disputes/:id/review')
export class StartReviewController {
    constructor(private readonly disputeService: DisputeService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async startReview(@Param('id') id: string, @Req() req: Request): Promise<StartReviewResponse> {
        const requestingUser = (req as any).user;
        const data = await this.disputeService.startReviewAPI(id, requestingUser);

        return {
            success: true,
            message: 'Dispute moved to review',
            data,
        };
    }
}
