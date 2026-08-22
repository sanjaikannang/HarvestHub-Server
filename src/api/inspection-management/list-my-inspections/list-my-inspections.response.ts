import { InspectionSummary } from '../inspection-summary.dto';

export class ListMyInspectionsResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary[];
}
