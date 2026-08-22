import { IsMongoId, IsOptional } from 'class-validator';

export class ListPayoutsQuery {

    @IsOptional()
    @IsMongoId()
    districtId?: string;

}
