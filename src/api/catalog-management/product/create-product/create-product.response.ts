import { ProductSummary } from '../product-summary.dto';

export class CreateProductResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
