import { CategorySummary } from '../category-summary.dto';

export class ListCategoriesResponse {
    success: boolean;
    message: string;
    data?: CategorySummary[];
}
