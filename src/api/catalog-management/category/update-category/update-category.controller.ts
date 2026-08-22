import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateCategoryRequest } from './update-category.request';
import { UpdateCategoryResponse } from './update-category.response';
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from 'src/services/category-service/category.service';

@Controller('categories')
export class UpdateCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updateCategory(
        @Param('id') id: string,
        @Body() body: UpdateCategoryRequest,
    ): Promise<UpdateCategoryResponse> {
        const data = await this.categoryService.updateCategoryAPI(id, body);

        return {
            success: true,
            message: 'Category updated successfully',
            data,
        };
    }
}
