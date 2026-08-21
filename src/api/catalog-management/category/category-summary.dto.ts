import { PerishabilityTier, UnitOfMeasure } from 'src/utils/enum';

// Shared response shape for a single category — reused across the
// create/update/deactivate/list/get controllers in this folder.
export class CategorySummary {
    id: string;
    name: { en: string; ta: string };
    perishabilityTier: PerishabilityTier;
    defaultUnitOfMeasure: UnitOfMeasure;
    subcategories: { key: string; name: { en: string; ta: string } }[];
    isActive: boolean;
}
