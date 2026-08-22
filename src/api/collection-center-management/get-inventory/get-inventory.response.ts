import { InventorySummary } from '../inventory-summary.dto';

export class GetInventoryResponse {
    success: boolean;
    message: string;
    data?: InventorySummary;
}
