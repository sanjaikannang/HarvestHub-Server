import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateProductRequest } from './create-product.request';
import { CreateProductResponse } from './create-product.response';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProductService } from 'src/services/product-service/product.service';

@Controller('products')
export class CreateProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FARMER)
    async createProduct(@Body() body: CreateProductRequest, @Req() req: Request): Promise<CreateProductResponse> {
        const farmerId = (req as any).user.sub;
        const data = await this.productService.createProductAPI(farmerId, body);

        return {
            success: true,
            message: 'Product submitted successfully',
            data,
        };
    }
}
