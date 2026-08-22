import { IsMongoId, IsOptional } from 'class-validator';

// Super Admin may filter by any districtId; District Admin is always scoped
// to their own district regardless of this value (see OrderService.listOrdersAPI).
export class ListOrdersQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
