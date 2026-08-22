import { InventoryStatus } from 'src/utils/enum';

// Shared response shape for a single inventory entry — reused across the
// list/get/reserve/dispatch controllers in this folder.
export class InventorySummary {
    id: string;
    collectionCenterId: string;
    productId: string;
    receivedQuantity: number;
    receivedDate: Date;
    status: InventoryStatus;
    reservedAt?: Date;
    dispatchedAt?: Date;
    deliveryPartnerId?: string;
}
