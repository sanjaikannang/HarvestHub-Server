import { ProductSummary } from '../product-summary.dto';

export class GetProductResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
