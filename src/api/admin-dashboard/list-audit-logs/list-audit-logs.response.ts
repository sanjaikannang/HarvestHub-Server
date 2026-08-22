import { AuditLogSummary } from '../audit-log-summary.dto';

export class ListAuditLogsResponse {
    success: boolean;
    message: string;
    data?: AuditLogSummary[];
}
