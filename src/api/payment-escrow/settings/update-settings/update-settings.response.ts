import { SettingsSummary } from '../settings-summary.dto';

export class UpdateSettingsResponse {
    success: boolean;
    message: string;
    data?: SettingsSummary;
}
