import { ProductSummary } from '../product-summary.dto';

export class UpdateProductResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
