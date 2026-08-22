import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from 'src/services/category-service/category.service';
import { DeactivateCategoryResponse } from './deactivate-category.response';

@Controller('categories')
export class DeactivateCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async deactivateCategory(@Param('id') id: string): Promise<DeactivateCategoryResponse> {
        const data = await this.categoryService.deactivateCategoryAPI(id);

        return {
            success: true,
            message: 'Category deactivated successfully',
            data,
        };
    }
}
