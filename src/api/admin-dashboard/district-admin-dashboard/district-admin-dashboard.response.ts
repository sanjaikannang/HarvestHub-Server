export class DistrictAdminDashboardData {
    districtId: string;
    pendingProductReviews: number;
    pendingInspections: number;
    activeBiddingSessions: number;
    ordersInProgress: number;
    openDisputes: number;
    totalDisputes: number;
}

export class DistrictAdminDashboardResponse {
    success: boolean;
    message: string;
    data?: DistrictAdminDashboardData;
}
