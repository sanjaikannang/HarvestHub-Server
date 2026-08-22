import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationChannel, NotificationType, PreferredLanguage } from 'src/utils/enum';

export type NotificationDocument = Notification & Document;

// A persisted, per-user notification record — powers both the real-time
// in-app push (NotificationGateway) and the notification history/inbox (see
// database/notifications.md). Rendered once at send time from a
// NotificationTemplate in the recipient's preferredLanguage, snapshotted
// into `locale` so a later language change doesn't rewrite history.
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(NotificationType) })
    type: NotificationType;

    @Prop({ required: true, enum: Object.values(PreferredLanguage) })
    locale: PreferredLanguage;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true, enum: Object.values(NotificationChannel) })
    channel: NotificationChannel;

    @Prop()
    relatedEntityType?: string;

    @Prop({ type: Types.ObjectId })
    relatedEntityId?: Types.ObjectId;

    @Prop({ default: false })
    isRead: boolean;

}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
