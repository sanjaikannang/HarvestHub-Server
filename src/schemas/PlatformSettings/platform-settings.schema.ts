import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformSettingsDocument = PlatformSettings & Document;

// Singleton document (a fixed, well-known _id — see PlatformSettingsRepositoryService)
// holding platform-wide configuration. Currently just the commission rate
// (requirement.md: "Commission percentage is configurable by Super Admin,
// globally or per category" — per-category override isn't built, this is
// the global rate). Not modeled as one row per setting since there's only
// ever been a need for exactly one value so far.
@Schema({ timestamps: true })
export class PlatformSettings {

    @Prop({ required: true, default: 5 })
    commissionPercentage: number;

}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
