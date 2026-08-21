import { DistrictSummary } from '../district-summary.dto';

export class UpdateDistrictResponse {
    success: boolean;
    message: string;
    data?: DistrictSummary;
}
