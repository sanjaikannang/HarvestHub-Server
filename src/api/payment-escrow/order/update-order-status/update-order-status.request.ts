import { IsEnum } from 'class-validator';
import { DeliveryStatus } from 'src/utils/enum';

export class UpdateOrderStatusRequest {

    @IsEnum(DeliveryStatus)
    status: DeliveryStatus;

}
