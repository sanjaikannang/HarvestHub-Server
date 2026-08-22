import { InventorySummary } from '../inventory-summary.dto';

export class ReserveInventoryResponse {
    success: boolean;
    message: string;
    data?: InventorySummary;
}
