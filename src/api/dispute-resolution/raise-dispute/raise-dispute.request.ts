import { DisputeReason } from 'src/utils/enum';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RaiseDisputeRequest {

    @IsMongoId()
    orderId: string;

    @IsEnum(DisputeReason)
    reason: DisputeReason;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    photos?: string[];

}
