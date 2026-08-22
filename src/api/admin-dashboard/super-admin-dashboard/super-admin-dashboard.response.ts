class DistrictOverviewEntry {
    id: string;
    name: string;
    state: string;
    districtAdminId?: string;
    isActive: boolean;
    stats: {
        activeFarmers: number;
        activeBuyers: number;
        productsInPipeline: number;
        ordersInProgress: number;
    };
}

export class SuperAdminDashboardData {
    districts: DistrictOverviewEntry[];
    totalFarmers: number;
    totalBuyers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    pendingEscalations: number;
}

export class SuperAdminDashboardResponse {
    success: boolean;
    message: string;
    data?: SuperAdminDashboardData;
}
