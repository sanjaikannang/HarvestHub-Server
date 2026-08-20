import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthActivityLog, AuthActivityLogDocument } from 'src/schemas/AuthActivityLog/auth-activity-log.schema';

@Injectable()
export class AuthActivityLogRepositoryService {
    constructor(
        @InjectModel(AuthActivityLog.name) private authActivityLogModel: Model<AuthActivityLogDocument>,
    ) { }


    // Create Auth Activity Log
    async create(data: Partial<AuthActivityLog>): Promise<AuthActivityLogDocument> {
        try {
            const log = new this.authActivityLogModel(data);
            return await log.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to record auth activity log', error);
        }
    }


    // Find recent activity for a user (newest first)
    async findByUserId(userId: Types.ObjectId, limit = 50): Promise<AuthActivityLogDocument[]> {
        try {
            return await this.authActivityLogModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch auth activity log', error);
        }
    }


    // Find the most recent activity across every user — admin dashboard feed
    async findRecent(limit = 20): Promise<AuthActivityLogDocument[]> {
        try {
            return await this.authActivityLogModel
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch auth activity log', error);
        }
    }

}
