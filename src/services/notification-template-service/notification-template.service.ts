import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationTemplateRepositoryService } from 'src/repositories/notification-template-repository/notification-template.repository';
import { NotificationTemplateDocument } from 'src/schemas/NotificationTemplate/notification-template.schema';

@Injectable()
export class NotificationTemplateService {
    constructor(
        private readonly notificationTemplateRepositoryService: NotificationTemplateRepositoryService,
    ) { }


    // List Notification Templates API Endpoint (Super Admin) — lets an admin
    // review/adjust the default copy without a redeploy
    async listTemplatesAPI() {
        const templates = await this.notificationTemplateRepositoryService.findAll();
        return templates.map((template) => this.toSummary(template));
    }


    // Update Notification Template API Endpoint (Super Admin)
    async updateTemplateAPI(id: string, translations: NotificationTemplateDocument['translations']) {
        const updated = await this.notificationTemplateRepositoryService.updateTranslations(id, translations);
        if (!updated) {
            throw new NotFoundException('Notification template not found');
        }
        return this.toSummary(updated);
    }


    private toSummary(template: NotificationTemplateDocument) {
        return {
            id: (template._id as Types.ObjectId).toString(),
            templateKey: template.templateKey,
            channel: template.channel,
            translations: template.translations,
            isActive: template.isActive,
        };
    }

}
