import { InventorySummary } from '../inventory-summary.dto';

export class DispatchInventoryResponse {
    success: boolean;
    message: string;
    data?: InventorySummary;
}
