import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { CollectionMethod } from 'src/utils/enum';

export class ScheduleInspectionRequest {

    @IsMongoId()
    productId: string;

    @IsMongoId()
    inspectorId: string;

    @IsEnum(CollectionMethod)
    collectionMethod: CollectionMethod;

    @IsDate()
    @Type(() => Date)
    scheduledDate: Date;

    @IsString()
    @IsNotEmpty()
    scheduledSlot: string;

}
