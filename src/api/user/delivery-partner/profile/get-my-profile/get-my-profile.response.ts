import { DeliveryPartnerAvailability, PreferredLanguage, UserRole } from "src/utils/enum";

export class DeliveryPartnerProfileData {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole;
    districtId?: string;
    preferredLanguage: PreferredLanguage;
    isPhoneVerified: boolean;
    districtsServiced?: string[];
    vehicleType?: string;
    vehicleNumber?: string;
    capacityKg?: number;
    currentStatus?: DeliveryPartnerAvailability;
    activeOrderCount?: number;
    rating?: number;
}

export class GetMyProfileResponse {
    success: boolean;
    message: string;
    data?: DeliveryPartnerProfileData;
}
