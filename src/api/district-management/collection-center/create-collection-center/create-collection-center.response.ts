import { CollectionCenterSummary } from '../collection-center-summary.dto';

export class CreateCollectionCenterResponse {
    success: boolean;
    message: string;
    data?: CollectionCenterSummary;
}
