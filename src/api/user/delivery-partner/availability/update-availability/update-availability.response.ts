import { DeliveryPartnerAvailability } from 'src/utils/enum';

export class UpdateAvailabilityResponse {
    success: boolean;
    message: string;
    data?: { currentStatus: DeliveryPartnerAvailability };
}
