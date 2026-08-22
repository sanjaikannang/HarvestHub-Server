import { IsMongoId } from 'class-validator';

export class AssignDeliveryPartnerRequest {

    @IsMongoId()
    deliveryPartnerId: string;

}
