import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Category, CategoryDocument, Subcategory } from 'src/schemas/Category/category.schema';
import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';


@Injectable()
export class CategoryRepositoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }


    // Create category
    async create(data: Partial<Category>): Promise<CategoryDocument> {
        try {
            const category = new this.categoryModel(data);
            return await category.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create category', error);
        }
    }


    // Find category by id
    async findById(id: string): Promise<CategoryDocument | null> {
        try {
            return await this.categoryModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find category by id', error);
        }
    }


    // Find category by its English name (enforces the unique index up front, with a clean error message)
    async findByNameEn(nameEn: string): Promise<CategoryDocument | null> {
        try {
            return await this.categoryModel.findOne({ 'name.en': nameEn }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find category by name', error);
        }
    }


    // List all categories
    async findAll(): Promise<CategoryDocument[]> {
        try {
            return await this.categoryModel.find().sort({ 'name.en': 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list categories', error);
        }
    }


    // Update name/perishabilityTier/defaultUnitOfMeasure/subcategories
    async updateDetails(
        id: string,
        updates: Partial<{ name: { en: string; ta: string }; perishabilityTier: PerishabilityTier; defaultUnitOfMeasure: UnitOfMeasure; subcategories: Subcategory[] }>,
    ): Promise<CategoryDocument | null> {
        try {
            const updated = await this.categoryModel.findByIdAndUpdate(id, updates, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update category', error);
        }
    }


    // Deactivate category
    async deactivate(id: string): Promise<CategoryDocument | null> {
        try {
            const updated = await this.categoryModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to deactivate category', error);
        }
    }

}
