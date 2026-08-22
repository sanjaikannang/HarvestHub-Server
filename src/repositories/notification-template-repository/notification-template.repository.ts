import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationChannel, NotificationType } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationTemplate, NotificationTemplateDocument } from 'src/schemas/NotificationTemplate/notification-template.schema';

@Injectable()
export class NotificationTemplateRepositoryService {
    constructor(
        @InjectModel(NotificationTemplate.name) private templateModel: Model<NotificationTemplateDocument>,
    ) { }


    async findByKeyAndChannel(templateKey: NotificationType, channel: NotificationChannel): Promise<NotificationTemplateDocument | null> {
        try {
            return await this.templateModel.findOne({ templateKey, channel, isActive: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find notification template', error);
        }
    }


    async findAll(): Promise<NotificationTemplateDocument[]> {
        try {
            return await this.templateModel.find().sort({ templateKey: 1, channel: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list notification templates', error);
        }
    }


    // Idempotent boot-time seeding — inserts a default only if the
    // {templateKey, channel} pair doesn't already exist, never overwrites an
    // admin's edits on restart (see NotificationTemplateService.seedDefaultsAPI)
    async upsertIfMissing(data: Partial<NotificationTemplate>): Promise<void> {
        try {
            await this.templateModel.updateOne(
                { templateKey: data.templateKey, channel: data.channel },
                { $setOnInsert: data },
                { upsert: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to seed notification template', error);
        }
    }


    async updateTranslations(id: string, translations: NotificationTemplate['translations']): Promise<NotificationTemplateDocument | null> {
        try {
            return await this.templateModel.findByIdAndUpdate(id, { translations }, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to update notification template', error);
        }
    }

}
