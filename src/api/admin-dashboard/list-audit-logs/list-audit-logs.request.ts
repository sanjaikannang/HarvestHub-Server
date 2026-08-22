import { IsMongoId, IsOptional } from 'class-validator';

export class ListAuditLogsQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
