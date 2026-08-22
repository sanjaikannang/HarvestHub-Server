import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListMyProductsQuery } from './list-my-products.request';
import { ListMyProductsResponse } from './list-my-products.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('products/mine')
export class ListMyProductsController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FARMER)
    async listMyProducts(@Query() query: ListMyProductsQuery, @Req() req: Request): Promise<ListMyProductsResponse> {
        const farmerId = (req as any).user.sub;
        const data = await this.productService.listMyProductsAPI(farmerId, query.status);

        return {
            success: true,
            message: 'Products fetched successfully',
            data,
        };
    }
}
