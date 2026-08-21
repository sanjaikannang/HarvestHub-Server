import { PreferredLanguage, UserRole } from "src/utils/enum";

export class LoginResponse {

    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            name: string;
            phone: string;
            email?: string;
            role: UserRole;
            isFirstLogin: boolean;
        };
        tokens: {
            accessToken: string;
        };
    };

}
