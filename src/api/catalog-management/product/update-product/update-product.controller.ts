import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateProductRequest } from './update-product.request';
import { UpdateProductResponse } from './update-product.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class UpdateProductController {
    constructor(private readonly productService: ProductService) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FARMER)
    async updateProduct(
        @Param('id') id: string,
        @Body() body: UpdateProductRequest,
        @Req() req: Request,
    ): Promise<UpdateProductResponse> {
        const farmerId = (req as any).user.sub;
        const data = await this.productService.updateProductAPI(id, farmerId, body);

        return {
            success: true,
            message: 'Product updated successfully',
            data,
        };
    }
}
