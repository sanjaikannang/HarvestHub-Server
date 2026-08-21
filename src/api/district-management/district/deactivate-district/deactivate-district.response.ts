import { DistrictSummary } from '../district-summary.dto';

export class DeactivateDistrictResponse {
    success: boolean;
    message: string;
    data?: DistrictSummary;
}
