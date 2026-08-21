import { ProductSummary } from '../product-summary.dto';

export class RejectProductResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
