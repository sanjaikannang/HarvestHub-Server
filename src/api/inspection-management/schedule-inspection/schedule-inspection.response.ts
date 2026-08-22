import { InspectionSummary } from '../inspection-summary.dto';

export class ScheduleInspectionResponse {
    success: boolean;
    message: string;
    data?: InspectionSummary;
}
