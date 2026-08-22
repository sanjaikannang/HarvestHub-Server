import { CategorySummary } from '../category-summary.dto';

export class GetCategoryResponse {
    success: boolean;
    message: string;
    data?: CategorySummary;
}
