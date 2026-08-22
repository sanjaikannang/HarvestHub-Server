import { CategorySummary } from '../category-summary.dto';

export class CreateCategoryResponse {
    success: boolean;
    message: string;
    data?: CategorySummary;
}
