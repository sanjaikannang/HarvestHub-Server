export class InspectorSummary {
    id: string;
    name: string;
    phone: string;
    email?: string;
    districtId?: string;
}

export class ListInspectorsResponse {
    success: boolean;
    message: string;
    data?: InspectorSummary[];
}
