import { DistrictDirectoryEntry } from '../district-summary.dto';

export class ListDistrictsResponse {
    success: boolean;
    message: string;
    data?: DistrictDirectoryEntry[];
}
