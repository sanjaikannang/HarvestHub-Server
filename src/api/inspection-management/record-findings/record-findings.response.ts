import { InspectionSummary } from '../inspection-summary.dto';

export class RecordFindingsResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary;
}
