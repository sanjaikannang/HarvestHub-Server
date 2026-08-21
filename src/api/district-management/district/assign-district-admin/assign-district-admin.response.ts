import { DistrictSummary } from '../district-summary.dto';

export class AssignDistrictAdminResponse {
    success: boolean;
    message: string;
    data?: DistrictSummary;
}
