import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ProductService } from 'src/services/product-service/product.service';
import { ListProductsForReviewQuery } from './list-products-for-review.request';
import { ListProductsForReviewResponse } from './list-products-for-review.response';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class ListProductsForReviewController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listProductsForReview(
        @Query() query: ListProductsForReviewQuery,
        @Req() req: Request,
    ): Promise<ListProductsForReviewResponse> {
        const requestingUser = (req as any).user;
        const data = await this.productService.listProductsForReviewAPI(requestingUser, query);

        return {
            success: true,
            message: 'Products fetched successfully',
            data,
        };
    }
}
