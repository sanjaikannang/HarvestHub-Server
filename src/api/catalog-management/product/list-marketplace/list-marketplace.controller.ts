import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ProductService } from 'src/services/product-service/product.service';
import { ListMarketplaceResponse } from './list-marketplace.response';

// No @Roles() restriction — any authenticated user may browse what's for sale
// (Farmers/Admins get the fuller review queue via GET /products instead).
@Controller('products/marketplace')
export class ListMarketplaceController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async listMarketplace(): Promise<ListMarketplaceResponse> {
        const data = await this.productService.listMarketplaceAPI();

        return {
            success: true,
            message: 'Marketplace products fetched successfully',
            data,
        };
    }
}
