import { Model, Types } from 'mongoose';
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


    // Admin Dashboard's audit log view (module 11) — District Admin scoped to
    // their own district, Super Admin unscoped or filtered by districtId
    async findAll(filter: { districtId?: string } = {}): Promise<AuditLogDocument[]> {
        try {
            const query: Record<string, unknown> = {};
            if (filter.districtId) {
                query.districtId = new Types.ObjectId(filter.districtId);
            }
            return await this.auditLogModel.find(query).sort({ createdAt: -1 }).limit(200).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list audit log entries', error);
        }
    }

}
