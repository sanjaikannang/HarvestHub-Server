import { IsMongoId, IsOptional } from 'class-validator';

// Super Admin may filter by districtId; District Admin is always scoped to
// their own district regardless of this value (see
// CollectionCenterService.listCollectionCentersAPI).
export class ListCollectionCentersQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
