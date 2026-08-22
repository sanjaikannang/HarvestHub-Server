import { IsMongoId, IsOptional } from 'class-validator';

// Super Admin may filter by districtId; District Admin is always scoped to
// their own district regardless of this value (see InspectionService.listInspectionsAPI).
export class ListInspectionsQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
