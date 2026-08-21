// Shared response shape for a single district — reused across the
// create/update/deactivate/assign-admin/get controllers in this folder.
export class DistrictSummary {
    id: string;
    name: string;
    state: string;
    districtAdminId?: string;
    isActive: boolean;
}

export class DistrictDirectoryEntry extends DistrictSummary {
    stats: {
        activeFarmers: number;
        activeBuyers: number;
        productsInPipeline: number;
        ordersInProgress: number;
    };
}
