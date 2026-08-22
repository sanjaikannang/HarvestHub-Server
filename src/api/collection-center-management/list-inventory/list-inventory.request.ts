import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { InventoryStatus } from 'src/utils/enum';

// Super Admin may filter by any collectionCenterId; District Admin is always
// scoped to their own district's centers regardless of this value (see
// CollectionCenterInventoryService.listInventoryAPI).
export class ListInventoryQuery {

    @IsOptional()
    @IsMongoId()
    collectionCenterId?: string;

    @IsOptional()
    @IsEnum(InventoryStatus)
    status?: InventoryStatus;

}
