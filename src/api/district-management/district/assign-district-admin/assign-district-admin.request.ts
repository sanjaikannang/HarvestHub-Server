import { IsMongoId } from 'class-validator';

export class AssignDistrictAdminRequest {

    @IsMongoId()
    userId: string;

}
