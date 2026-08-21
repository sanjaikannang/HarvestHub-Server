import { Types } from 'mongoose';
import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CategoryRepositoryService } from 'src/repositories/category-repository/category.repository';

export interface SubcategoryInput {
    key: string;
    name: { en: string; ta: string };
}

export interface CategoryUpdateData {
    name?: { en: string; ta: string };
    perishabilityTier?: PerishabilityTier;
    defaultUnitOfMeasure?: UnitOfMeasure;
    subcategories?: SubcategoryInput[];
}

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepositoryService: CategoryRepositoryService,
    ) { }


    // Create Category API Endpoint (Super Admin)
    async createCategoryAPI(data: {
        name: { en: string; ta: string };
        perishabilityTier: PerishabilityTier;
        defaultUnitOfMeasure: UnitOfMeasure;
        subcategories: SubcategoryInput[];
    }) {
        const existing = await this.categoryRepositoryService.findByNameEn(data.name.en);
        if (existing) {
            throw new ConflictException('A category with this English name already exists');
        }

        this.assertUniqueSubcategoryKeys(data.subcategories);

        const category = await this.categoryRepositoryService.create(data);
        return this.toSummary(category);
    }


    // Update Category API Endpoint (Super Admin) — name/perishabilityTier/
    // defaultUnitOfMeasure, and/or a full replacement of the subcategories list
    async updateCategoryAPI(categoryId: string, data: CategoryUpdateData) {
        const category = await this.categoryRepositoryService.findById(categoryId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (data.name && data.name.en !== category.name.en) {
            const existing = await this.categoryRepositoryService.findByNameEn(data.name.en);
            if (existing && (existing._id as Types.ObjectId).toString() !== categoryId) {
                throw new ConflictException('A category with this English name already exists');
            }
        }

        if (data.subcategories) {
            this.assertUniqueSubcategoryKeys(data.subcategories);
        }

        const updated = await this.categoryRepositoryService.updateDetails(categoryId, data);
        return this.toSummary(updated!);
    }


    // Deactivate Category API Endpoint (Super Admin)
    async deactivateCategoryAPI(categoryId: string) {
        const category = await this.categoryRepositoryService.findById(categoryId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (!category.isActive) {
            throw new BadRequestException('Category is already inactive');
        }

        const updated = await this.categoryRepositoryService.deactivate(categoryId);
        return this.toSummary(updated!);
    }


    // List Categories API Endpoint (any authenticated role — Farmers browse
    // this taxonomy when submitting a product)
    async listCategoriesAPI() {
        const categories = await this.categoryRepositoryService.findAll();
        return categories.map((category) => this.toSummary(category));
    }


    // Get Category By Id API Endpoint (any authenticated role)
    async getCategoryByIdAPI(categoryId: string) {
        const category = await this.categoryRepositoryService.findById(categoryId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return this.toSummary(category);
    }


    private assertUniqueSubcategoryKeys(subcategories: SubcategoryInput[]): void {
        const keys = subcategories.map((subcategory) => subcategory.key);
        if (new Set(keys).size !== keys.length) {
            throw new BadRequestException('Subcategory keys must be unique within a category');
        }
    }


    private toSummary(category: {
        _id: Types.ObjectId;
        name: { en: string; ta: string };
        perishabilityTier: PerishabilityTier;
        defaultUnitOfMeasure: UnitOfMeasure;
        subcategories: SubcategoryInput[];
        isActive: boolean;
    }) {
        return {
            id: (category._id as Types.ObjectId).toString(),
            name: category.name,
            perishabilityTier: category.perishabilityTier,
            defaultUnitOfMeasure: category.defaultUnitOfMeasure,
            subcategories: category.subcategories,
            isActive: category.isActive,
        };
    }

}
