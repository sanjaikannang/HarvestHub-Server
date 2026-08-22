import { CategorySummary } from '../category-summary.dto';

export class UpdateCategoryResponse {
    success: boolean;
    message: string;
    data?: CategorySummary;
}
