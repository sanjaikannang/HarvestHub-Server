import { IsMongoId, IsOptional } from 'class-validator';

// Super Admin may filter by districtId; District Admin is always scoped to
// their own district regardless of this value (see AuthService.listInspectorsAPI).
export class ListInspectorsQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
