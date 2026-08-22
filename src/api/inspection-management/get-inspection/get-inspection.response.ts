import { InspectionSummary } from '../inspection-summary.dto';

export class GetInspectionResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary;
}
