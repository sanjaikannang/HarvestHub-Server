import { ProductSummary } from '../product-summary.dto';

export class ListMarketplaceResponse {
    success: boolean;
    message: string;
    data?: ProductSummary[];
}
