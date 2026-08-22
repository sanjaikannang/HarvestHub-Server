import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DeliveryAddressDto } from '../../delivery-address.dto';

export class CheckoutRequest {

    @ValidateNested()
    @Type(() => DeliveryAddressDto)
    deliveryAddress: DeliveryAddressDto;

}
