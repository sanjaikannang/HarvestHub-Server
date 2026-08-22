export class AuditLogSummary {
    id: string;
    actorId: string;
    actorRole: string;
    action: string;
    targetEntityType: string;
    targetEntityId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
    districtId?: string;
    createdAt: Date;
}
