import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationChannel, NotificationType } from 'src/utils/enum';

export type NotificationTemplateDocument = NotificationTemplate & Document;

class TranslationPair {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;
}

class Translations {
    @Prop({ type: TranslationPair, required: true })
    en: TranslationPair;

    @Prop({ type: TranslationPair, required: true })
    ta: TranslationPair;
}

// Bilingual source templates the Notification service resolves by
// {templateKey, channel} and renders into a per-user Notification (see
// database/notification-templates.md). Seeded automatically on boot — see
// NotificationTemplateService.seedDefaultsAPI — rather than requiring manual
// admin setup before the app is usable.
@Schema({ timestamps: true })
export class NotificationTemplate {

    @Prop({ required: true, enum: Object.values(NotificationType) })
    templateKey: NotificationType;

    @Prop({ required: true, enum: Object.values(NotificationChannel) })
    channel: NotificationChannel;

    @Prop({ type: Translations, required: true })
    translations: Translations;

    @Prop({ default: true })
    isActive: boolean;

}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

NotificationTemplateSchema.index({ templateKey: 1, channel: 1 }, { unique: true });
