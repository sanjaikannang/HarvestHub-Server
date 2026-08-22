import { ProductSummary } from '../product-summary.dto';

export class ListMyProductsResponse {
    success: boolean;
    message: string;
    data?: ProductSummary[];
}
