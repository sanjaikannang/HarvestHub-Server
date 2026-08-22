import { IsEnum } from 'class-validator';
import { DeliveryPartnerAvailability } from 'src/utils/enum';

export class UpdateAvailabilityRequest {

    @IsEnum(DeliveryPartnerAvailability)
    status: DeliveryPartnerAvailability;

}
