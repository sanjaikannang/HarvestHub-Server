import { CollectionCenterSummary } from '../collection-center-summary.dto';

export class UpdateCollectionCenterResponse {
    success: boolean;
    message: string;
    data?: CollectionCenterSummary;
}
