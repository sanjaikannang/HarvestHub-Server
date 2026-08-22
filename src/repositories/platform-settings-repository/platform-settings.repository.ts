import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PlatformSettings, PlatformSettingsDocument } from 'src/schemas/PlatformSettings/platform-settings.schema';

@Injectable()
export class PlatformSettingsRepositoryService {
    constructor(
        @InjectModel(PlatformSettings.name) private settingsModel: Model<PlatformSettingsDocument>,
    ) { }


    // Singleton — creates the one settings document (with schema defaults) on
    // first access if it doesn't exist yet, otherwise returns the existing one
    async getOrCreate(): Promise<PlatformSettingsDocument> {
        try {
            const existing = await this.settingsModel.findOne().exec();
            if (existing) {
                return existing;
            }
            const created = new this.settingsModel({});
            return await created.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to load platform settings', error);
        }
    }


    async updateCommissionPercentage(commissionPercentage: number): Promise<PlatformSettingsDocument> {
        try {
            const settings = await this.getOrCreate();
            settings.commissionPercentage = commissionPercentage;
            return await settings.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to update commission percentage', error);
        }
    }

}
