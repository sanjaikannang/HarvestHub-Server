import { DistrictSummary } from '../district-summary.dto';

export class CreateDistrictResponse {
    success: boolean;
    message: string;
    data?: DistrictSummary;
}
