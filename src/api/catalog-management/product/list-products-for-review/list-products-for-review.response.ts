import { ProductSummary } from '../product-summary.dto';

export class ListProductsForReviewResponse {
    success: boolean;
    message: string;
    data?: ProductSummary[];
}
