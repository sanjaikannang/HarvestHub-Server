import { PreferredLanguage, UserRole } from "src/utils/enum";

export class InspectorProfileData {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole;
    districtId?: string;
    preferredLanguage: PreferredLanguage;
    isPhoneVerified: boolean;
}

export class GetMyProfileResponse {
    success: boolean;
    message: string;
    data?: InspectorProfileData;
}
