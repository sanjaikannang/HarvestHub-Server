import { IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from 'src/utils/enum';

export class ListMyProductsQuery {

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

}
