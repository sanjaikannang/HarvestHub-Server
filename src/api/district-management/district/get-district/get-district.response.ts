import { DistrictSummary } from '../district-summary.dto';

export class GetDistrictResponse {
    success: boolean;
    message: string;
    data?: DistrictSummary;
}
