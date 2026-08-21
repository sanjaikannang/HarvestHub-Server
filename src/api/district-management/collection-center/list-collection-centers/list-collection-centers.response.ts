import { CollectionCenterSummary } from '../collection-center-summary.dto';

export class ListCollectionCentersResponse {
    success: boolean;
    message: string;
    data?: CollectionCenterSummary[];
}
