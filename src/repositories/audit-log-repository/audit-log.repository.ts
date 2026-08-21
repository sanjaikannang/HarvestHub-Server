import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuditLog, AuditLogDocument } from 'src/schemas/AuditLog/audit-log.schema';


@Injectable()
export class AuditLogRepositoryService {
    constructor(
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    ) { }


    // Create an audit log entry — write-only, immutable (see database/audit-logs.md)
    async create(data: Partial<AuditLog>): Promise<AuditLogDocument> {
        try {
            const entry = new this.auditLogModel(data);
            return await entry.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create audit log entry', error);
        }
    }

}
