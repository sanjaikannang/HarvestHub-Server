import { ProductSummary } from '../product-summary.dto';

export class RequestChangesResponse {
    success: boolean;
    message: string;
    data?: ProductSummary;
}
