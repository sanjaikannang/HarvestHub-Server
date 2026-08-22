import { DisputeStatus } from 'src/utils/enum';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class ListDisputesQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

    @IsOptional()
    @IsEnum(DisputeStatus)
    status?: DisputeStatus;

}
