import { SettingsSummary } from '../settings-summary.dto';

export class GetSettingsResponse {
    success: boolean;
    message: string;
    data?: SettingsSummary;
}
