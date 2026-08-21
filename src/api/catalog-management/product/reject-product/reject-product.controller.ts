import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RejectProductRequest } from './reject-product.request';
import { RejectProductResponse } from './reject-product.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class RejectProductController {
    constructor(private readonly productService: ProductService) { }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async rejectProduct(
        @Param('id') id: string,
        @Body() body: RejectProductRequest,
        @Req() req: Request,
    ): Promise<RejectProductResponse> {
        const requestingUser = (req as any).user;
        const data = await this.productService.rejectProductAPI(id, body.reason, requestingUser);

        return {
            success: true,
            message: 'Product rejected',
            data,
        };
    }
}
