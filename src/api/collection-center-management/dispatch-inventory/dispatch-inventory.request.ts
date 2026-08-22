import { IsMongoId } from 'class-validator';

export class DispatchInventoryRequest {

    @IsMongoId()
    deliveryPartnerId: string;

}
