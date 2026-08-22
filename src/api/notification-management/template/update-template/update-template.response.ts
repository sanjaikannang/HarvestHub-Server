import { TemplateSummary } from '../template-summary.dto';

export class UpdateTemplateResponse {
    success: boolean;
    message: string;
    data?: TemplateSummary;
}
