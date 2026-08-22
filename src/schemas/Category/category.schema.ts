import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';

export type CategoryDocument = Category & Document;

@Schema({ _id: false })
export class LocaleText {

    @Prop({ required: true })
    en: string;

    @Prop({ required: true })
    ta: string;

}

export const LocaleTextSchema = SchemaFactory.createForClass(LocaleText);

@Schema({ _id: false })
export class Subcategory {

    // Stable, language-independent slug (e.g. `tomato`) referenced by
    // products.subcategoryKey — display name is resolved via `name`.
    @Prop({ required: true })
    key: string;

    @Prop({ type: LocaleTextSchema, required: true })
    name: LocaleText;

}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

// Master taxonomy of agricultural product categories (see database/categories.md).
@Schema({ timestamps: true })
export class Category {

    @Prop({ type: LocaleTextSchema, required: true })
    name: LocaleText;

    @Prop({ required: true, enum: Object.values(PerishabilityTier) })
    perishabilityTier: PerishabilityTier;

    @Prop({ required: true, enum: Object.values(UnitOfMeasure) })
    defaultUnitOfMeasure: UnitOfMeasure;

    @Prop({ type: [SubcategorySchema], required: true })
    subcategories: Subcategory[];

    @Prop({ default: true })
    isActive: boolean;

}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ 'name.en': 1 }, { unique: true });
