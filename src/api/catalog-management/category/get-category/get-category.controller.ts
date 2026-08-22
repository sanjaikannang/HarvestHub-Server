import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetCategoryResponse } from './get-category.response';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from 'src/services/category-service/category.service';

@Controller('categories')
export class GetCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    async getCategory(@Param('id') id: string): Promise<GetCategoryResponse> {
        const data = await this.categoryService.getCategoryByIdAPI(id);

        return {
            success: true,
            message: 'Category fetched successfully',
            data,
        };
    }
}
