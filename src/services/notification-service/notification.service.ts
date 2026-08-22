import { Types } from 'mongoose';
import { SmsService } from 'src/services/sms-service/sms.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';
import { NotificationChannel, NotificationType } from 'src/utils/enum';
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { NotificationRepositoryService } from 'src/repositories/notification-repository/notification.repository';
import { NotificationTemplateRepositoryService } from 'src/repositories/notification-template-repository/notification-template.repository';
import { NotificationDocument } from 'src/schemas/Notification/notification.schema';
import { DEFAULT_NOTIFICATION_TEMPLATES } from './notification-templates.seed';

export interface RelatedEntity {
    type: string;
    id: string;
}

@Injectable()
export class NotificationService implements OnModuleInit {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly notificationRepositoryService: NotificationRepositoryService,
        private readonly notificationTemplateRepositoryService: NotificationTemplateRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly smsService: SmsService,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    async onModuleInit(): Promise<void> {
        await this.seedDefaultsAPI();
    }


    // Idempotent — only fills in a {templateKey, channel} pair that doesn't
    // already exist, so an admin's later edits survive a restart
    async seedDefaultsAPI(): Promise<void> {
        for (const template of DEFAULT_NOTIFICATION_TEMPLATES) {
            await this.notificationTemplateRepositoryService.upsertIfMissing(template);
        }
    }


    // Core send — called from every other module as an event sink (requirement.md).
    // Resolves the recipient's own preferredLanguage (never the caller's),
    // renders each requested channel's template, persists it, and pushes it
    // out. Never throws: a notification failure must never break the
    // business flow that triggered it.
    async notifyAPI(
        userId: string,
        type: NotificationType,
        placeholders: Record<string, string>,
        related?: RelatedEntity,
        channels: NotificationChannel[] = [NotificationChannel.IN_APP],
    ): Promise<void> {
        try {
            const user = await this.userRepositoryService.findById(userId);
            if (!user) {
                this.logger.warn(`Cannot notify unknown user ${userId}`);
                return;
            }

            for (const channel of channels) {
                const template = await this.notificationTemplateRepositoryService.findByKeyAndChannel(type, channel);
                if (!template) {
                    this.logger.warn(`No active ${channel} template for ${type} — skipping`);
                    continue;
                }

                const pair = template.translations[user.preferredLanguage] ?? template.translations.en;
                const title = this.render(pair.title, placeholders);
                const message = this.render(pair.message, placeholders);

                const notification = await this.notificationRepositoryService.create({
                    userId: new Types.ObjectId(userId),
                    type,
                    locale: user.preferredLanguage,
                    title,
                    message,
                    channel,
                    relatedEntityType: related?.type,
                    relatedEntityId: related ? new Types.ObjectId(related.id) : undefined,
                });

                if (channel === NotificationChannel.IN_APP) {
                    this.notificationGateway.emitNotificationReceived(userId, this.toSummary(notification));
                } else if (channel === NotificationChannel.SMS) {
                    await this.smsService.send(user.phone, message);
                }
            }
        } catch (error) {
            this.logger.error(`Failed to notify user ${userId} of ${type}`, error as Error);
        }
    }


    // List My Notifications API Endpoint
    async listMyNotificationsAPI(userId: string, filter: { isRead?: boolean }) {
        const notifications = await this.notificationRepositoryService.findByUserId(userId, filter);
        return notifications.map((notification) => this.toSummary(notification));
    }


    // Unread Count API Endpoint — for a nav-bar badge
    async getUnreadCountAPI(userId: string) {
        return { count: await this.notificationRepositoryService.countUnread(userId) };
    }


    // Mark Read API Endpoint (own notification only)
    async markReadAPI(id: string, userId: string) {
        const updated = await this.notificationRepositoryService.markRead(id, userId);
        if (!updated) {
            throw new NotFoundException('Notification not found');
        }
        return this.toSummary(updated);
    }


    // Mark All Read API Endpoint
    async markAllReadAPI(userId: string): Promise<void> {
        await this.notificationRepositoryService.markAllRead(userId);
    }


    private render(template: string, placeholders: Record<string, string>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => placeholders[key] ?? '');
    }


    private toSummary(notification: NotificationDocument) {
        return {
            id: (notification._id as Types.ObjectId).toString(),
            type: notification.type,
            locale: notification.locale,
            title: notification.title,
            message: notification.message,
            channel: notification.channel,
            relatedEntityType: notification.relatedEntityType,
            relatedEntityId: notification.relatedEntityId?.toString(),
            isRead: notification.isRead,
            createdAt: (notification as any).createdAt,
        };
    }

}
