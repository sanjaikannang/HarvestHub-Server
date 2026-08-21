import { UserRole } from "src/utils/enum";

export class RegisterResponse {

    success: boolean;
    message: string;
    data?: {
        id: string;
        name: string;
        phone: string;
        email?: string;
        role: UserRole;
    };

}
