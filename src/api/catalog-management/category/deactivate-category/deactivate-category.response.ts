import { CategorySummary } from '../category-summary.dto';

export class DeactivateCategoryResponse {
    success: boolean;
    message: string;
    data?: CategorySummary;
}
