import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetProductResponse } from './get-product.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class GetProductController {
    constructor(private readonly productService: ProductService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.FARMER, UserRole.INSPECTOR, UserRole.BUYER)
    async getProduct(@Param('id') id: string, @Req() req: Request): Promise<GetProductResponse> {
        const requestingUser = (req as any).user;
        const data = await this.productService.getProductByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Product fetched successfully',
            data,
        };
    }
}
