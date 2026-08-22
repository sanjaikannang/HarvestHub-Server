import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateCategoryRequest } from './create-category.request';
import { CreateCategoryResponse } from './create-category.response';
import { CategoryService } from 'src/services/category-service/category.service';

@Controller('categories')
export class CreateCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async createCategory(@Body() body: CreateCategoryRequest): Promise<CreateCategoryResponse> {
        const data = await this.categoryService.createCategoryAPI(body);

        return {
            success: true,
            message: 'Category created successfully',
            data,
        };
    }
}
