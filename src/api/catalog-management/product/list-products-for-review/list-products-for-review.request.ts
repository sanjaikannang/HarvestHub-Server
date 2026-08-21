import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ProductStatus } from 'src/utils/enum';

// Super Admin may filter by districtId; District Admin is always scoped to
// their own district regardless of this value (see
// ProductService.listProductsForReviewAPI).
export class ListProductsForReviewQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

}
