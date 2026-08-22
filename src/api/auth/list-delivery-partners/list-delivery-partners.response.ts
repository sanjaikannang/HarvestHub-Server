export class DeliveryPartnerSummary {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export class ListDeliveryPartnersResponse {
    success: boolean;
    message: string;
    data?: DeliveryPartnerSummary[];
}
