import { InspectionSummary } from '../inspection-summary.dto';

export class DecideInspectionResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary;
}
