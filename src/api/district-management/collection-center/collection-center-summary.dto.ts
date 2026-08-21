import { CollectionCenterAddress } from 'src/schemas/CollectionCenter/collection-center.schema';

// Shared response shape for a single collection center — reused across the
// create/update/list/get controllers in this folder.
export class CollectionCenterSummary {
    id: string;
    districtId: string;
    name: string;
    address: CollectionCenterAddress;
    contactPhone: string;
    capacityKg?: number;
    isActive: boolean;
}
