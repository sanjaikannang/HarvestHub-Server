import { InspectionSummary } from '../inspection-summary.dto';

export class ListInspectionsResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary[];
}
