import { ProductSummary } from '../product-summary.dto';

export class StartReviewResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
