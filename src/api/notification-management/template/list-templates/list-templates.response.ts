import { TemplateSummary } from '../template-summary.dto';

export class ListTemplatesResponse {
    success: boolean;
    message: string;
    data?: TemplateSummary[];
}
