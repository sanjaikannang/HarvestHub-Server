import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Notification, NotificationDocument } from 'src/schemas/Notification/notification.schema';

@Injectable()
export class NotificationRepositoryService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }


    async create(data: Partial<Notification>): Promise<NotificationDocument> {
        try {
            const notification = new this.notificationModel(data);
            return await notification.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create notification', error);
        }
    }


    async findByUserId(userId: string, filter: { isRead?: boolean } = {}): Promise<NotificationDocument[]> {
        try {
            const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
            if (filter.isRead !== undefined) {
                query.isRead = filter.isRead;
            }
            return await this.notificationModel.find(query).sort({ createdAt: -1 }).limit(100).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list notifications', error);
        }
    }


    async countUnread(userId: string): Promise<number> {
        try {
            return await this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to count unread notifications', error);
        }
    }


    // Scoped to the owning user so one buyer can't mark another's notification read
    async markRead(id: string, userId: string): Promise<NotificationDocument | null> {
        try {
            return await this.notificationModel.findOneAndUpdate(
                { _id: id, userId: new Types.ObjectId(userId) },
                { isRead: true },
                { new: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to mark notification as read', error);
        }
    }


    async markAllRead(userId: string): Promise<void> {
        try {
            await this.notificationModel.updateMany({ userId: new Types.ObjectId(userId), isRead: false }, { isRead: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to mark notifications as read', error);
        }
    }

}
