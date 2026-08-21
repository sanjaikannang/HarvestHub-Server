import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoryService } from 'src/services/category-service/category.service';
import { ListCategoriesResponse } from './list-categories.response';

// No @Roles() restriction — any authenticated user may browse the taxonomy
// (Farmers need this to pick a category/subcategory when submitting a product).
@Controller('categories')
export class ListCategoriesController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    async listCategories(): Promise<ListCategoriesResponse> {
        const data = await this.categoryService.listCategoriesAPI();

        return {
            success: true,
            message: 'Categories fetched successfully',
            data,
        };
    }
}
