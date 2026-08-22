export class CreateDeliveryPartnerResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        name: string;
        phone: string;
        email?: string;
        role: string;
    };
}
