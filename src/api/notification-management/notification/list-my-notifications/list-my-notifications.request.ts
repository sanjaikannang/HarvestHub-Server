import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListMyNotificationsQuery {

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isRead?: boolean;

}
