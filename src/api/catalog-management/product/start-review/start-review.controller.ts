import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { StartReviewResponse } from './start-review.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Patch, Param, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class StartReviewController {
    constructor(private readonly productService: ProductService) { }

    @Patch(':id/start-review')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async startReview(@Param('id') id: string, @Req() req: Request): Promise<StartReviewResponse> {
        const requestingUser = (req as any).user;
        const data = await this.productService.startReviewAPI(id, requestingUser);

        return {
            success: true,
            message: 'Product moved to review',
            data,
        };
    }
}
