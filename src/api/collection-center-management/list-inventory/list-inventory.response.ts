import { InventorySummary } from '../inventory-summary.dto';

export class ListInventoryResponse {
    success: boolean;
    message: string;
    data?: InventorySummary[];
}
