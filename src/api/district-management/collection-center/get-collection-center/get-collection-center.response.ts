import { CollectionCenterSummary } from '../collection-center-summary.dto';

export class GetCollectionCenterResponse {
    success: boolean;
    message: string;
    data?: CollectionCenterSummary;
}
