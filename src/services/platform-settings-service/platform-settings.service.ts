import { Injectable } from '@nestjs/common';
import { PlatformSettingsRepositoryService } from 'src/repositories/platform-settings-repository/platform-settings.repository';

@Injectable()
export class PlatformSettingsService {
    constructor(
        private readonly platformSettingsRepositoryService: PlatformSettingsRepositoryService,
    ) { }


    // Get Platform Settings API Endpoint (Super Admin)
    async getSettingsAPI() {
        const settings = await this.platformSettingsRepositoryService.getOrCreate();
        return { commissionPercentage: settings.commissionPercentage };
    }


    // Update Commission Percentage API Endpoint (Super Admin) — global rate;
    // per-category override isn't built (requirement.md offers it as an
    // alternative, not a requirement — see database/categories.md, unchanged).
    async updateCommissionAPI(commissionPercentage: number) {
        const updated = await this.platformSettingsRepositoryService.updateCommissionPercentage(commissionPercentage);
        return { commissionPercentage: updated.commissionPercentage };
    }

}
